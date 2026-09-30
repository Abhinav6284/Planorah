/**
 * BehavioralIntelligencePanel — Primary intelligence dashboard widget.
 * Renders behavioral metrics, insights, loops, predictions, adaptations, and identity.
 * Replaces the static AI Insight Card with a dynamic, behavior-aware system.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Zap,
    Shield,
    Target,
    RefreshCw,
    Sparkles,
    Activity,
    Eye,
    Loader2,
    X,
} from 'lucide-react';
import { useIntelligenceStore } from '../../../store/useIntelligenceStore';

const shellCard = {
    background: 'var(--el-glass-panel)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: 'var(--el-glass-border)',
    boxShadow: 'var(--el-glass-shadow)',
};

const pillStyle = (color = 'var(--el-text-muted)') => ({
    padding: '3px 10px',
    borderRadius: 9999,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color,
    border: `1px solid ${color}22`,
    background: `${color}08`,
});

const deriveExecutionStates = (metrics) => {
    if (!metrics) return [];
    const states = [];

    const flow = metrics.momentum_score ?? 50;
    let flowState = { label: 'Stable', color: '#10b981', type: 'strength' };
    if (flow >= 75) flowState = { label: 'Strong', color: '#10b981', type: 'strength' };
    else if (flow >= 50) flowState = { label: 'Stable', color: '#10b981', type: 'strength' };
    else if (flow >= 35) flowState = { label: 'Drifting', color: '#f59e0b', type: 'warning' };
    else flowState = { label: 'Strained', color: '#ef4444', type: 'warning' };
    states.push({ id: 'flow', label: 'Flow', value: flowState.label, color: flowState.color, type: flowState.type, score: flow });

    const focus = 100 - (metrics.dropoff_risk ?? 50);
    let focusState = { label: 'Stable', color: '#10b981', type: 'strength' };
    if (focus >= 75) focusState = { label: 'Strong', color: '#10b981', type: 'strength' };
    else if (focus >= 50) focusState = { label: 'Stable', color: '#10b981', type: 'strength' };
    else if (focus >= 35) focusState = { label: 'Drifting', color: '#f59e0b', type: 'warning' };
    else focusState = { label: 'Needs Attention', color: '#ef4444', type: 'warning' };
    states.push({ id: 'focus', label: 'Focus', value: focusState.label, color: focusState.color, type: focusState.type, score: focus });

    const energy = 100 - (metrics.burnout_risk ?? 50);
    let energyState = { label: 'Healthy', color: '#10b981', type: 'strength' };
    if (energy >= 70) energyState = { label: 'Healthy', color: '#10b981', type: 'strength' };
    else if (energy >= 45) energyState = { label: 'Stable', color: '#10b981', type: 'strength' };
    else if (energy >= 30) energyState = { label: 'Recovering', color: 'var(--orange)', type: 'neutral' };
    else energyState = { label: 'Strained', color: '#ef4444', type: 'warning' };
    states.push({ id: 'energy', label: 'Energy', value: energyState.label, color: energyState.color, type: energyState.type, score: energy });

    const conf = 100 - (metrics.procrastination_index ?? 50);
    let confState = { label: 'Growing', color: '#10b981', type: 'strength' };
    if (conf >= 75) confState = { label: 'Strong', color: '#10b981', type: 'strength' };
    else if (conf >= 55) confState = { label: 'Growing', color: '#10b981', type: 'strength' };
    else if (conf >= 40) confState = { label: 'Stable', color: '#10b981', type: 'strength' };
    else confState = { label: 'Shaky', color: '#f59e0b', type: 'warning' };
    states.push({ id: 'confidence', label: 'Confidence', value: confState.label, color: confState.color, type: confState.type, score: conf });

    return states;
};

const getPrioritizedStates = (states) => {
    if (!states || states.length === 0) return [];
    const flow = states.find(s => s.id === 'flow');
    const others = states.filter(s => s.id !== 'flow');
    
    const warnings = others.filter(s => s.type === 'warning').sort((a, b) => a.score - b.score);
    const strengths = others.filter(s => s.type === 'strength').sort((a, b) => b.score - a.score);
    
    const display = [flow];
    if (warnings.length > 0) display.push(warnings[0]);
    if (strengths.length > 0) {
        const topStrength = strengths.find(s => !display.includes(s));
        if (topStrength) display.push(topStrength);
    }
    
    if (display.length < 3) {
        for (const s of others) {
            if (!display.includes(s)) {
                display.push(s);
                if (display.length >= 3) break;
            }
        }
    }
    
    return display.filter(Boolean);
};

const riskLevelColor = (level) => {
    const colors = {
        critical: '#ef4444',
        high: '#f59e0b',
        moderate: 'var(--orange)',
        low: '#10b981',
    };
    return colors[level] || 'var(--el-text-muted)';
};

const insightToneIcon = (tone) => {
    const icons = {
        encouraging: Sparkles,
        cautioning: AlertTriangle,
        celebrating: Zap,
        neutral: Activity,
    };
    return icons[tone] || Activity;
};

const InsightCard = ({ insight, onDismiss }) => {
    const ToneIcon = insightToneIcon(insight.tone);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
                padding: '14px 16px',
                borderRadius: 18,
                background: 'var(--el-bg-secondary)',
                border: '1px solid var(--el-border-subtle)',
                position: 'relative',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ToneIcon style={{ width: 14, height: 14, color: 'var(--orange)', flexShrink: 0 }} />
                <span style={pillStyle('var(--el-text-muted)')}>
                    {insight.type || 'behavioral'}
                </span>
                {onDismiss && (
                    <button
                        onClick={() => onDismiss(insight.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginLeft: 4 }}
                    >
                        <X style={{ width: 12, height: 12, color: 'var(--el-text-muted)' }} />
                    </button>
                )}
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--el-text)', marginBottom: 4, lineHeight: 1.3 }}>
                {insight.title}
            </h4>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--el-text-secondary)', margin: 0 }}>
                {insight.description}
            </p>
            {insight.strategy && (
                <p style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, marginTop: 8, margin: '8px 0 0' }}>
                    → {insight.strategy}
                </p>
            )}
        </motion.div>
    );
};

const RiskPrediction = ({ label, risk }) => {
    if (!risk) return null;
    const color = riskLevelColor(risk.risk_level || risk.friction_level);
    const level = risk.risk_level || risk.friction_level || 'unknown';

    return (
        <div style={{
            padding: '12px 14px',
            borderRadius: 16,
            background: 'var(--el-bg-secondary)',
            border: '1px solid var(--el-border-subtle)',
            borderLeft: `3px solid ${color}`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--el-text-muted)',
                }}>
                    {label}
                </span>
                <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color,
                    textTransform: 'capitalize',
                }}>
                    {level}
                </span>
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--el-text-secondary)', margin: 0 }}>
                {risk.reasoning || risk.reasons?.[0] || ''}
            </p>
            {risk.timeline && (
                <p style={{ fontSize: 11, color: 'var(--el-text-muted)', marginTop: 4, margin: '4px 0 0' }}>
                    ⏱ {risk.timeline}
                </p>
            )}
        </div>
    );
};

const AdaptationCard = ({ adaptation, onApply }) => {
    if (!adaptation || adaptation.applied) return null;

    return (
        <div style={{
            padding: '14px 16px',
            borderRadius: 16,
            background: 'var(--el-bg-secondary)',
            border: '1px solid var(--el-border-subtle)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Target style={{ width: 14, height: 14, color: 'var(--orange)' }} />
                <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--el-text-muted)',
                }}>
                    {(adaptation.display_type || adaptation.change_type || '').replace(/_/g, ' ')}
                </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--el-text-secondary)', margin: '0 0 10px' }}>
                {adaptation.description}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                {(adaptation.suggested_changes || []).slice(0, 3).map((change, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: 'var(--el-text-secondary)' }}>
                        <span style={{ width: 5, height: 5, borderRadius: 9999, background: 'var(--orange)', marginTop: 5, flexShrink: 0 }} />
                        <span>{change}</span>
                    </div>
                ))}
            </div>
            {onApply && (
                <button
                    onClick={() => onApply(adaptation.id)}
                    style={{
                        width: '100%',
                        padding: '8px 0',
                        borderRadius: 10,
                        border: '1px solid rgba(243, 107, 34, 0.3)',
                        background: 'rgba(243, 107, 34, 0.08)',
                        color: 'var(--orange)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    Shift Strategy
                </button>
            )}
        </div>
    );
};

const IdentityBadge = ({ identity }) => {
    if (!identity) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(243, 107, 34, 0.06) 0%, rgba(243, 107, 34, 0.02) 100%)',
            border: '1px solid rgba(243, 107, 34, 0.12)',
        }}>
            <div style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'rgba(243, 107, 34, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Shield style={{ width: 18, height: 18, color: 'var(--orange)' }} />
            </div>
            <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--el-text)' }}>
                    {identity.display_name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--el-text-secondary)', marginTop: 2 }}>
                    {identity.description}
                </div>
            </div>
        </div>
    );
};

const BehavioralIntelligencePanel = () => {
    const {
        metrics,
        insights,
        loops,
        risks,
        adaptations,
        projections,
        identity,
        overallNarrative,
        loading,
        loadIntelligence,
        dismissInsight,
        applyAdaptation,
    } = useIntelligenceStore();

    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadIntelligence();
    }, [loadIntelligence]);

    const handleRefresh = useCallback(() => {
        loadIntelligence(true);
    }, [loadIntelligence]);

    const activeInsights = useMemo(
        () => (insights || []).filter((i) => i.is_active !== false).slice(0, 4),
        [insights]
    );

    const pendingAdaptations = useMemo(
        () => (adaptations || []).filter((a) => !a.applied && !a.reverted).slice(0, 2),
        [adaptations]
    );

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Eye },
        { key: 'insights', label: 'Observations', icon: BrainCircuit },
        { key: 'risks', label: 'Trajectories', icon: AlertTriangle },
        { key: 'adapt', label: 'Strategy', icon: Target },
    ];

    if (loading && !metrics) {
        return (
            <div
                className="rounded-[24px] p-6"
                style={{ ...shellCard, minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}
            >
                <Loader2 style={{ width: 24, height: 24, color: 'var(--orange)', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'var(--el-text-muted)', fontWeight: 600 }}>
                    Computing behavioral intelligence...
                </span>
            </div>
        );
    }

    return (
        <div className="rounded-[24px] p-5" style={shellCard}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BrainCircuit style={{ width: 16, height: 16, color: 'var(--orange)' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--el-text)', letterSpacing: '-0.01em' }}>
                        Behavioral Intelligence
                    </span>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        borderRadius: 8,
                        border: 'var(--el-glass-border)',
                        background: 'var(--el-bg-secondary)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--el-text-muted)',
                        cursor: loading ? 'wait' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    <RefreshCw style={{ width: 11, height: 11, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    Refresh
                </button>
            </div>



            {/* Identity Badge */}
            <div style={{ marginBottom: 16 }}>
                <IdentityBadge identity={identity} />
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: 2,
                marginBottom: 16,
                padding: 3,
                borderRadius: 12,
                background: 'var(--el-bg-secondary)',
                border: '1px solid var(--el-border-subtle)',
            }}>
                {tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                                padding: '7px 0',
                                borderRadius: 10,
                                border: 'none',
                                background: isActive ? 'var(--el-bg)' : 'transparent',
                                color: isActive ? 'var(--el-text)' : 'var(--el-text-muted)',
                                fontSize: 11,
                                fontWeight: isActive ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                fontFamily: "'Inter', sans-serif",
                                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                            }}
                        >
                            <TabIcon style={{ width: 12, height: 12 }} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (() => {
                    const allStates = deriveExecutionStates(metrics);
                    const displayStates = getPrioritizedStates(allStates);
                    return (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            style={{ display: 'grid', gap: 10 }}
                        >
                            <div style={{
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'var(--el-text-muted)',
                                paddingLeft: 4,
                            }}>
                                Today's Execution State
                            </div>
                            
                            <div style={{ display: 'grid', gap: 8 }}>
                                {displayStates.map(state => (
                                    <div key={state.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 16, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border-subtle)' }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--el-text)' }}>{state.label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: state.color }}>
                                            {state.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {overallNarrative && (
                                <div style={{
                                    marginTop: 4,
                                    padding: '14px 16px',
                                    borderRadius: 16,
                                    background: 'linear-gradient(135deg, rgba(243, 107, 34, 0.04) 0%, rgba(243, 107, 34, 0.01) 100%)',
                                    border: '1px solid rgba(243, 107, 34, 0.1)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                        <Sparkles style={{ width: 14, height: 14, color: 'var(--orange)' }} />
                                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--orange)' }}>
                                            Insight
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--el-text-secondary)', margin: 0 }}>
                                        "{overallNarrative}"
                                    </p>
                                </div>
                            )}
                            
                            {/* Loops */}
                            {loops?.length > 0 && (
                                <div style={{
                                    marginTop: 4,
                                    padding: '12px 14px',
                                    borderRadius: 16,
                                    background: 'rgba(245, 158, 11, 0.04)',
                                    border: '1px solid rgba(245, 158, 11, 0.12)',
                                }}>
                                    <div style={{
                                        fontSize: 10,
                                        fontWeight: 800,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        color: '#f59e0b',
                                        marginBottom: 8,
                                    }}>
                                        Detected Loops
                                    </div>
                                    {loops.slice(0, 2).map((loop, i) => (
                                        <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--el-text-secondary)', marginBottom: i < loops.length - 1 ? 6 : 0 }}>
                                            {loop.description}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    );
                })()}

                {activeTab === 'insights' && (
                    <motion.div
                        key="insights"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        style={{ display: 'grid', gap: 10 }}
                    >
                        {activeInsights.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--el-text-muted)', textAlign: 'center', padding: '20px 0' }}>
                                No active insights yet. Keep building your execution pattern.
                            </p>
                        ) : (
                            activeInsights.map((insight) => (
                                <InsightCard key={insight.id || insight.title} insight={insight} onDismiss={insight.id ? dismissInsight : null} />
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === 'risks' && (
                    <motion.div
                        key="risks"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        style={{ display: 'grid', gap: 10 }}
                    >
                        <RiskPrediction label="Energy Forecast" risk={risks?.burnout} />
                        <RiskPrediction label="Focus Trajectory" risk={risks?.dropoff} />
                        <RiskPrediction label="Execution Friction" risk={risks?.roadmap_friction} />

                        {/* Future Projections */}
                        {projections && (
                            <div style={{
                                padding: '14px 16px',
                                borderRadius: 16,
                                background: 'var(--el-bg-secondary)',
                                border: '1px solid var(--el-border-subtle)',
                            }}>
                                <div style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: 'var(--el-text-muted)',
                                    marginBottom: 10,
                                }}>
                                    Future Paths
                                </div>
                                {['current_path', 'optimized_path'].map((key) => {
                                    const path = projections[key];
                                    if (!path) return null;
                                    return (
                                        <div key={key} style={{ marginBottom: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                {key === 'optimized_path' ? (
                                                    <TrendingUp style={{ width: 13, height: 13, color: '#10b981' }} />
                                                ) : (
                                                    <TrendingDown style={{ width: 13, height: 13, color: 'var(--el-text-muted)' }} />
                                                )}
                                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--el-text)' }}>
                                                    {path.title}
                                                </span>
                                                {typeof path.probability === 'number' && (
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange)', marginLeft: 'auto' }}>
                                                        {path.probability}%
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--el-text-secondary)', margin: 0 }}>
                                                {path.completion_estimate} — {path.description?.slice(0, 120)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'adapt' && (
                    <motion.div
                        key="adapt"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        style={{ display: 'grid', gap: 10 }}
                    >
                        {pendingAdaptations.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '24px 16px',
                                borderRadius: 16,
                                background: 'var(--el-bg-secondary)',
                                border: '1px solid var(--el-border-subtle)',
                            }}>
                                <Shield style={{ width: 24, height: 24, color: '#10b981', margin: '0 auto 8px' }} />
                                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--el-text)' }}>No adaptations needed</p>
                                <p style={{ fontSize: 12, color: 'var(--el-text-muted)', marginTop: 4 }}>
                                    Your roadmap pacing is compatible with your current behavior.
                                </p>
                            </div>
                        ) : (
                            pendingAdaptations.map((adaptation) => (
                                <AdaptationCard
                                    key={adaptation.id}
                                    adaptation={adaptation}
                                    onApply={applyAdaptation}
                                />
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BehavioralIntelligencePanel;
