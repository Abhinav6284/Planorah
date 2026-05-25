/**
 * useIntelligenceStore — Zustand store for Behavioral Intelligence System.
 * Manages behavioral metrics, insights, loops, risks, adaptations, and identity.
 */

import { create } from 'zustand';
import { intelligenceService } from '../api/intelligenceService';

const INTELLIGENCE_CACHE_KEY = 'planora.intelligence.cache.v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const readCache = () => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(INTELLIGENCE_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.cached_at) return null;
        if (Date.now() - new Date(parsed.cached_at).getTime() > CACHE_TTL_MS) return null;
        return parsed;
    } catch {
        return null;
    }
};

const writeCache = (data) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(INTELLIGENCE_CACHE_KEY, JSON.stringify({
            ...data,
            cached_at: new Date().toISOString(),
        }));
    } catch {
        // Ignore cache write failures
    }
};

const cached = readCache();

export const useIntelligenceStore = create((set, get) => ({
    // Core intelligence data
    metrics: cached?.metrics || null,
    context: cached?.context || null,
    insights: cached?.insights || [],
    loops: cached?.loops || [],
    risks: cached?.risks || null,
    adaptations: cached?.adaptations || [],
    projections: cached?.projections || null,
    identity: cached?.identity || null,
    identityEvolution: cached?.identityEvolution || [],

    // Derived display data
    overallNarrative: cached?.overallNarrative || '',
    identityMessage: cached?.identityMessage || '',
    source: cached?.source || '',
    generatedAt: cached?.generatedAt || null,

    // Snapshots history (for charts)
    snapshots: [],

    // UI state
    loading: false,
    error: null,
    lastFetched: cached?.lastFetched || null,

    /**
     * Load full behavioral intelligence payload.
     * @param {boolean} refresh - Force refresh from backend
     */
    loadIntelligence: async (refresh = false) => {
        const state = get();

        // Skip if recently loaded and not forcing refresh
        if (!refresh && state.lastFetched) {
            const elapsed = Date.now() - new Date(state.lastFetched).getTime();
            if (elapsed < CACHE_TTL_MS) return;
        }

        set({ loading: true, error: null });

        try {
            const data = await intelligenceService.getBehavioralIntelligence(refresh);

            const update = {
                metrics: data.metrics || null,
                context: data.context || null,
                insights: data.insights || [],
                loops: data.loops || [],
                risks: data.risks || null,
                adaptations: data.adaptations || [],
                projections: data.projections || null,
                identity: data.identity || null,
                identityEvolution: data.identity_evolution || [],
                overallNarrative: data.overall_narrative || '',
                identityMessage: data.identity_message || '',
                source: data.source || '',
                generatedAt: data.generated_at || null,
                lastFetched: new Date().toISOString(),
                loading: false,
            };

            set(update);
            writeCache(update);
        } catch (error) {
            set({
                loading: false,
                error: error?.message || 'Failed to load behavioral intelligence',
            });
        }
    },

    /**
     * Load behavior snapshot history for trend charts.
     */
    loadSnapshots: async (days = 30) => {
        try {
            const data = await intelligenceService.getSnapshots(days);
            set({ snapshots: Array.isArray(data) ? data : [] });
        } catch (error) {
            console.warn('[Intelligence] Failed to load snapshots:', error);
        }
    },

    /**
     * Dismiss an insight.
     */
    dismissInsight: async (insightId) => {
        try {
            await intelligenceService.dismissInsight(insightId);
            set((state) => ({
                insights: state.insights.filter((i) => i.id !== insightId),
            }));
        } catch (error) {
            console.warn('[Intelligence] Failed to dismiss insight:', error);
        }
    },

    /**
     * Apply an adaptation recommendation.
     */
    applyAdaptation: async (adaptationId) => {
        try {
            await intelligenceService.applyAdaptation(adaptationId);
            set((state) => ({
                adaptations: state.adaptations.map((a) =>
                    a.id === adaptationId ? { ...a, applied: true } : a
                ),
            }));
            // Refresh intelligence after applying
            get().loadIntelligence(true);
        } catch (error) {
            console.warn('[Intelligence] Failed to apply adaptation:', error);
        }
    },

    /**
     * Revert a previously applied adaptation.
     */
    revertAdaptation: async (adaptationId) => {
        try {
            await intelligenceService.revertAdaptation(adaptationId);
            set((state) => ({
                adaptations: state.adaptations.map((a) =>
                    a.id === adaptationId ? { ...a, reverted: true } : a
                ),
            }));
        } catch (error) {
            console.warn('[Intelligence] Failed to revert adaptation:', error);
        }
    },

    /**
     * Track a frontend event silently.
     */
    trackEvent: async (eventType, metadata = {}) => {
        intelligenceService.trackEvent(eventType, metadata);
    },
}));
