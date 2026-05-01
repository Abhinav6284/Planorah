import React from 'react';

const difficultyStyles = {
    easy: 'bg-emerald-400/20 text-emerald-200 border-emerald-300/30',
    medium: 'bg-amber-400/20 text-amber-100 border-amber-300/40',
    hard: 'bg-rose-400/20 text-rose-100 border-rose-300/40',
};

const TodayFocusCard = ({ task, onStart, onSkip, onChangeTask }) => {
    if (!task) {
        return (
            <div style={{ padding: 32, borderRadius: 16, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--el-text-muted)' }}>Preparing your focus session...</p>
            </div>
        );
    }

    const level = (task.difficulty || 'medium').toLowerCase();

    return (
        <div style={{ 
            borderRadius: 16, border: '1px solid var(--el-border)', background: 'var(--el-bg)', 
            padding: 32, boxShadow: 'var(--el-shadow-card)', color: 'var(--el-text)'
        }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 12 }}>Current Objective</p>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--el-text)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{task.title}</h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                <span style={{ 
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, 
                    background: 'var(--el-bg-secondary)', color: 'var(--el-text-secondary)', border: '1px solid var(--el-border-subtle)'
                }}>{task.estimated_time || '25 min'}</span>
                <span style={{ 
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    background: 'var(--el-bg-secondary)', color: 'var(--el-text-secondary)', border: '1px solid var(--el-border-subtle)'
                }}>{level}</span>
            </div>

            <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border-subtle)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--el-text-muted)', marginBottom: 8 }}>Strategic Rationale</p>
                <p style={{ fontSize: 14, color: 'var(--el-text-secondary)', lineHeight: 1.5 }}>{task.reason || 'This task is selected to maintain your current learning momentum and ensure consistent progress towards your goals.'}</p>
            </div>

            <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <button
                    onClick={onStart}
                    style={{ 
                        padding: '10px 24px', borderRadius: 10, background: 'var(--el-text)', color: 'var(--el-bg)',
                        fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.1s'
                    }}
                >
                    Initiate Focus
                </button>
                <button
                    onClick={onChangeTask}
                    style={{ 
                        padding: '10px 24px', borderRadius: 10, background: 'var(--el-bg)', border: '1px solid var(--el-border)', 
                        color: 'var(--el-text-secondary)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.1s'
                    }}
                >
                    Modify Objective
                </button>
                <button
                    onClick={onSkip}
                    style={{ 
                        padding: '10px 20px', borderRadius: 10, background: 'transparent', border: 'none', 
                        color: 'var(--el-text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};

export default TodayFocusCard;
