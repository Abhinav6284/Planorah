import React from 'react';

const ProgressReframeCard = ({ stats, weeklyCompleted }) => {
    const completed = stats?.tasks_completed || 0;

    let message = 'Start your first mission 🚀';
    let tone = 'text-cyan-200';

    if (completed > 0 && completed < 10) {
        message = "You're getting momentum 💪";
        tone = 'text-amber-200';
    }

    if (completed >= 10) {
        message = "You're on fire 🔥";
        tone = 'text-rose-200';
    }

    return (
        <div style={{ 
            borderRadius: 16, border: '1px solid var(--el-border)', background: 'var(--el-bg)', 
            padding: 24, boxShadow: 'var(--el-shadow-card)', color: 'var(--el-text)'
        }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 8 }}>Operational Status</p>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--el-text)', letterSpacing: '-0.02em' }}>{message}</h3>
            
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ fontSize: 13, color: 'var(--el-text-secondary)', fontWeight: 500 }}>{completed} Total Objectives Met</p>
                <p style={{ fontSize: 11, color: 'var(--el-text-muted)' }}>{weeklyCompleted || 0} completions in current cycle</p>
            </div>
        </div>
    );
};

export default ProgressReframeCard;
