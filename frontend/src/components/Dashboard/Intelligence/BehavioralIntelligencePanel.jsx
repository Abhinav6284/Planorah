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

const metricColor = (value, inverted = false) => {
    const v = inverted ? 100 - value : value;
    if (v >= 75) return '#10b981';
    if (v >= 50) return 'var(--orange)';
    if (v >= 30) return '#f59e0b';
    return '#ef4444';
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

const MetricGauge = ({ label, value, inverted = false, size = 'normal' }) => {
    const color = metricColor(value, inverted);
    const displayValue = typeof value === 'number' ? Math.round(value) : '--';
    const barWidth = typeof value === 'number' ? Math.min(100, Math.max(0, value)) : 0;
    const isSmall = size === 'small';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                    fontSize: isSmall ? 10 : 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--el-text-muted)',
                }}>
                    {label}
                </span>
                <span style={{
                    fontSize: isSmall ? 16 : 20,
                    fontWeight: 800,
                    color,
                    fontFamily: "'Inter', monospace",
                }}>
                    {displayValue}
                </span>
            </div>
            <div style={{
                height: isSmall ? 4 : 5,
                borderRadius: 9999,
                background: 'var(--el-bg-secondary)',
                overflow: 'hidden',
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        borderRadius: 9999,
                        background: `linear-gradient(90deg, ${color}88, ${color})`,
                    }}
                />
            </div>
        </div>
    );
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
                {typeof insight.confidence === 'number' && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange)', marginLeft: 'auto' }}>
                        {insight.confidence}%
                    </span>
                )}
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
                    {(adaptation.change_type || adaptation.display_type || '').replace(/_/g, ' ')}
                </span>
                {typeof adaptation.confidence === 'number' && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange)', marginLeft: 'auto' }}>
                        {adaptation.confidence}% confident
                    </span>
                )}
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
                    Apply Adaptation
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
            {typeof identity.confidence === 'number' && (
                <span style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--orange)',
                }}>
                    {identity.confidence}%
                </span>
            )}
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
        { key: 'insights', label: 'Insights', icon: BrainCircuit },
        { key: 'risks', label: 'Predictions', icon: AlertTriangle },
        { key: 'adapt', label: 'Adapt', icon: Target },
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

            {/* Narrative */}
            {overallNarrative && (
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--el-text-secondary)', marginBottom: 16, letterSpacing: '0.14px' }}>
                    {overallNarrative}
                </p>
            )}

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
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        style={{ display: 'grid', gap: 12 }}
                    >
                        {/* Metrics Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                            <MetricGauge label="Momentum" value={metrics?.momentum_score} />
                            <MetricGauge label="Consistency" value={metrics?.consistency_score} />
                            <MetricGauge label="Burnout Risk" value={metrics?.burnout_risk} inverted />
                            <MetricGauge label="Drop-off Risk" value={metrics?.dropoff_risk} inverted />
                        </div>

                        {/* Additional Metrics Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            <MetricGauge label="Recovery" value={metrics?.recovery_speed} size="small" />
                            <MetricGauge label="Avoidance" value={metrics?.procrastination_index} size="small" inverted />
                            <MetricGauge label="Completion" value={metrics?.completion_rate} size="small" />
                        </div>

                        {/* Loops */}
                        {loops?.length > 0 && (
                            <div style={{
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
                )}

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
                        <RiskPrediction label="Burnout Forecast" risk={risks?.burnout} />
                        <RiskPrediction label="Drop-off Forecast" risk={risks?.dropoff} />
                        <RiskPrediction label="Roadmap Friction" risk={risks?.roadmap_friction} />

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
