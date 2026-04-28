import React, { useState } from 'react';

const AICoachCard = ({ coach, onRegenerate, loading }) => {
    const [showReason, setShowReason] = useState(false);

    if (loading && !coach) {
        return (
            <div className="rounded-3xl border border-white/10 bg-[#121822] p-5 text-white animate-pulse">
                <div className="h-3 w-24 rounded bg-slate-700/60 mb-4" />
                <div className="h-7 w-3/4 rounded bg-slate-700/60 mb-3" />
                <div className="h-5 w-1/3 rounded bg-slate-700/60 mb-4" />
                <div className="h-10 w-28 rounded bg-slate-700/60" />
            </div>
        );
    }

    return (
        <div style={{ 
            background: 'var(--el-bg)', 
            border: '1px solid var(--el-border)', 
            borderRadius: 16, 
            padding: 24, 
            boxShadow: 'var(--el-shadow-card)',
            color: 'var(--el-text)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', marginBottom: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)' }}>AI Assistant</p>
                <button
                    onClick={onRegenerate}
                    disabled={loading}
                    style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                        background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)',
                        color: 'var(--el-text-secondary)', cursor: 'pointer', transition: 'all 0.1s'
                    }}
                >
                    {loading ? 'Thinking...' : 'Refresh'}
                </button>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--el-text)', lineHeight: 1.4, marginBottom: 8 }}>{coach?.task || 'Preparing recommendation...'}</h3>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--el-text-muted)' }}>
                <span>{coach?.estimated_time || '25 min'}</span>
                <span>•</span>
                <span style={{ textTransform: 'capitalize' }}>{coach?.difficulty || 'medium'} difficulty</span>
            </div>

            <button
                onClick={() => setShowReason((prev) => !prev)}
                style={{
                    marginTop: 20, padding: 0, background: 'none', border: 'none', 
                    fontSize: 12, fontWeight: 600, color: 'var(--el-text)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4
                }}
            >
                {showReason ? 'Hide Reasoning' : 'View Reasoning'}
            </button>

            {showReason && (
                <div style={{ 
                    marginTop: 12, padding: 16, borderRadius: 12, 
                    background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border-subtle)',
                    fontSize: 13, color: 'var(--el-text-secondary)', lineHeight: 1.5
                }}>
                    {coach?.reason || 'This recommendation optimizes consistency and impact based on your recent activity.'}
                </div>
            )}

            {Array.isArray(coach?.alternatives) && coach.alternatives.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 12 }}>Alternatives</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {coach.alternatives.map((option, idx) => (
                            <span key={`${option}-${idx}`} style={{ 
                                padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                                background: 'var(--el-bg)', border: '1px solid var(--el-border)', color: 'var(--el-text-secondary)'
                            }}>
                                {option}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AICoachCard;
