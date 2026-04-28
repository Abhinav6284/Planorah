import React from 'react';

const GamificationBar = ({ stats }) => {
    const xp = stats?.xp_points || 0;
    const streak = stats?.current_streak || 0;
    const level = stats?.level || 'Beginner';
    const currentBandMax = level === 'Elite' ? 2000 : level === 'Focused' ? 1500 : 500;
    const currentBandMin = level === 'Elite' ? 1500 : level === 'Focused' ? 500 : 0;
    const progress = Math.max(0, Math.min(100, ((xp - currentBandMin) / (currentBandMax - currentBandMin || 1)) * 100));

    return (
        <div style={{ 
            borderRadius: 16, border: '1px solid var(--el-border)', background: 'var(--el-bg)', 
            padding: 24, boxShadow: 'var(--el-shadow-card)', color: 'var(--el-text)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)' }}>Capability Level</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--el-text)', marginTop: 2 }}>{level}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)' }}>Consistency</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--el-text)', marginTop: 2 }}>{streak}d Streak</p>
                </div>
            </div>

            <div style={{ height: 6, background: 'var(--el-bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--el-text)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
            </div>

            <p style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: 'var(--el-text-secondary)' }}>{xp} XP Accumulation</p>
        </div>
    );
};

export default GamificationBar;
