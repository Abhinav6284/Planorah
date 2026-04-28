import React, { useMemo } from 'react';

const XP_LEVELS = [
    { level: 'Beginner', min: 0, max: 499 },
    { level: 'Focused', min: 500, max: 1499 },
    { level: 'Elite', min: 1500, max: 999999 },
];

const ProgressPanel = React.memo(({ tasks, stats, activityHeatmap }) => {
    const xpPoints = stats?.xp_points || 0;

    const xpData = useMemo(() => {
        const current = XP_LEVELS.find((item) => xpPoints >= item.min && xpPoints <= item.max) || XP_LEVELS[0];
        const next = XP_LEVELS.find((item) => item.min > current.min) || null;
        const currentSpan = Math.max(1, current.max - current.min + 1);
        const inLevel = Math.max(0, xpPoints - current.min);
        const percent = Math.min(100, Math.round((inLevel / currentSpan) * 100));

        return {
            current,
            next,
            percent,
            remaining: next ? next.min - xpPoints : 0,
            xpInCurrentLevel: inLevel,
            xpTotal: xpPoints
        };
    }, [xpPoints]);

    const todayData = useMemo(() => {
        const allTasks = tasks || [];
        const completed = allTasks.filter(t => t.status === 'completed').length;
        const total = Math.max(allTasks.length, completed, 1);
        const percent = Math.round((completed / total) * 100);

        return { completed, total, percent };
    }, [tasks]);

    const heatmap = useMemo(() => {
        const days = [];
        const now = new Date();
        const currentStreak = stats?.current_streak || 0;

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const iso = d.toISOString().slice(0, 10);
            // Also check local date key (e.g. "2026-04-16") for timezone robustness
            const localKey = d.toLocaleDateString('en-CA');

            let count = 0;

            // 1. Prefer server-provided activity_heatmap (most accurate)
            if (activityHeatmap && !Array.isArray(activityHeatmap)) {
                count = activityHeatmap[iso] ?? activityHeatmap[localKey] ?? 0;
            }

            // 2. Fallback: scan tasks for completed_at / updated_at matching this day
            if (count === 0) {
                count = (tasks || []).filter(t =>
                    t.status === 'completed' &&
                    String(t.completed_at || t.updated_at || '').slice(0, 10) === iso
                ).length;
            }

            // 3. Final fallback: infer from streak — the last `currentStreak` days
            //    going back from today were all active (login/study days)
            //    i=0 is today, i=1 is yesterday, etc.
            if (count === 0 && currentStreak > 0 && i < currentStreak) {
                count = 1;
            }

            days.push({
                label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                iso,
                count
            });
        }
        return days;
    }, [tasks, activityHeatmap, stats]);

    return (
        <div style={{ 
            background: 'var(--el-bg)', 
            border: '1px solid var(--el-border)', 
            borderRadius: 16, 
            padding: 24, 
            boxShadow: 'var(--el-shadow-card)',
            color: 'var(--el-text)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24
        }}>
            {/* Header: Level + XP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 8 }}>Status</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 28, fontWeight: 300, color: 'var(--el-text)', letterSpacing: '-0.04em', fontFamily: "'Inter', sans-serif" }}>{xpData.current.level}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--el-text-muted)' }}>Lvl {Math.floor(xpData.xpTotal / 500) + 1}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 8 }}>Daily Focus</p>
                    <span style={{ fontSize: 28, fontWeight: 300, color: 'var(--el-text)', letterSpacing: '-0.04em', fontFamily: "'Inter', sans-serif" }}>{todayData.percent}%</span>
                </div>
            </div>

            {/* XP Progress Bar */}
            {xpData.next && (
                <div style={{ marginBottom: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12, fontWeight: 600 }}>
                        <span style={{ color: 'var(--el-text-muted)' }}>Next: {xpData.next.level}</span>
                        <span style={{ color: 'var(--el-text)' }}>{xpData.remaining} XP to go</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--el-bg-secondary)', borderRadius: 10, overflow: 'hidden' }}>
                        <div
                            style={{ 
                                height: '100%', 
                                background: 'var(--el-text)', 
                                borderRadius: 10, 
                                width: `${xpData.percent}%`,
                                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Missions Info */}
            <div style={{ 
                padding: '12px 16px', borderRadius: 12, background: 'var(--el-bg-secondary)', 
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--el-text-secondary)' 
            }}>
                <span style={{ fontWeight: 800, color: 'var(--el-text)' }}>{todayData.completed}/{todayData.total}</span>
                <span>Missions completed today</span>
            </div>

            {/* Weekly Heatmap */}
            <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 16 }}>Activity consistency</p>
                <div style={{ display: 'flex', gap: 6 }}>
                    {heatmap.map((day, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div
                                title={`${day.count} task${day.count !== 1 ? 's' : ''} on ${day.iso}`}
                                style={{
                                    width: '100%', height: 24, borderRadius: 4, 
                                    background: day.count > 0 ? 'var(--el-text)' : 'var(--el-bg-secondary)',
                                    opacity: day.count > 0 ? Math.min(1, 0.3 + (day.count * 0.2)) : 1,
                                    transition: 'all 0.2s'
                                }}
                            />
                            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--el-text-muted)', textTransform: 'uppercase' }}>{day.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default ProgressPanel;
