/**
 * Intelligence Service — API layer for the Behavioral Intelligence System.
 * All intelligence API calls route through here.
 */

import api from './axios';

const requestWithFallback = async (request) => {
    try {
        return await request();
    } catch (error) {
        console.warn('[Intelligence] API call failed:', error?.message);
        throw error;
    }
};

export const intelligenceService = {
    /**
     * Get full behavioral intelligence payload.
     * Main endpoint — returns metrics, insights, loops, predictions, adaptations.
     * @param {boolean} refresh - Force recomputation (bypass cache)
     */
    getBehavioralIntelligence: async (refresh = false) => {
        const params = refresh ? { refresh: 'true' } : undefined;
        const response = await requestWithFallback(
            () => api.get('intelligence/behavioral/', { params, timeout: 15000 })
        );
        return response.data;
    },

    /**
     * Track a behavioral event from frontend.
     * @param {string} eventType - Event type from EventType constants
     * @param {object} metadata - Additional event context
     */
    trackEvent: async (eventType, metadata = {}) => {
        try {
            const response = await api.post('intelligence/events/', {
                event_type: eventType,
                metadata,
            }, { timeout: 5000 });
            return response.data;
        } catch (error) {
            // Silent fail — event tracking should never block UI
            console.warn('[Intelligence] Event tracking failed:', error?.message);
            return null;
        }
    },

    /**
     * Get active behavioral insights.
     */
    getInsights: async () => {
        const response = await requestWithFallback(
            () => api.get('intelligence/insights/', { timeout: 7000 })
        );
        return response.data;
    },

    /**
     * Dismiss an insight.
     * @param {string} insightId - UUID of the insight
     */
    dismissInsight: async (insightId) => {
        const response = await api.post(
            `intelligence/insights/${insightId}/dismiss/`
        );
        return response.data;
    },

    /**
     * Get pending adaptation recommendations.
     */
    getAdaptations: async () => {
        const response = await requestWithFallback(
            () => api.get('intelligence/adaptations/', { timeout: 7000 })
        );
        return response.data;
    },

    /**
     * Apply an adaptation.
     * @param {string} adaptationId - UUID of the adaptation
     */
    applyAdaptation: async (adaptationId) => {
        const response = await api.post(
            `intelligence/adaptations/${adaptationId}/apply/`
        );
        return response.data;
    },

    /**
     * Revert a previously applied adaptation.
     * @param {string} adaptationId - UUID of the adaptation
     */
    revertAdaptation: async (adaptationId) => {
        const response = await api.post(
            `intelligence/adaptations/${adaptationId}/revert/`
        );
        return response.data;
    },

    /**
     * Get behavior snapshot history.
     * @param {number} days - Number of days of history
     */
    getSnapshots: async (days = 30) => {
        const response = await requestWithFallback(
            () => api.get('intelligence/snapshots/', {
                params: { days },
                timeout: 7000,
            })
        );
        return response.data;
    },

    /**
     * Get detected behavioral patterns/loops.
     */
    getPatterns: async () => {
        const response = await requestWithFallback(
            () => api.get('intelligence/patterns/', { timeout: 7000 })
        );
        return response.data;
    },
};

/**
 * Frontend event types matching backend constants.
 * Use these when calling intelligenceService.trackEvent().
 */
export const EventTypes = {
    // Task Events
    TASK_STARTED: 'task_started',
    TASK_COMPLETED: 'task_completed',
    TASK_SKIPPED: 'task_skipped',
    TASK_DELAYED: 'task_delayed',
    TASK_REOPENED: 'task_reopened',
    TASK_ABANDONED: 'task_abandoned',

    // Session Events
    SESSION_STARTED: 'session_started',
    SESSION_ENDED: 'session_ended',
    SESSION_QUIT: 'session_quit',
    SESSION_INTERRUPTED: 'session_interrupted',

    // Roadmap Events
    ROADMAP_OPENED: 'roadmap_opened',
    ROADMAP_PROGRESS_UPDATED: 'roadmap_progress_updated',
    ROADMAP_ABANDONED: 'roadmap_abandoned',
    ROADMAP_COMPLETED: 'roadmap_completed',
    ROADMAP_SWITCHED: 'roadmap_switched',

    // AI Interaction Events
    AI_COACH_OPENED: 'ai_coach_opened',
    AI_STRATEGY_REQUESTED: 'ai_strategy_requested',
    VOICE_COACH_USED: 'voice_coach_used',
    INSIGHT_CLICKED: 'insight_clicked',
};
