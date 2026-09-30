import React, { useMemo } from 'react';
import { Target } from 'lucide-react';

const XP_LEVELS = [
    { level: 'Beginner', min: 0,    max: 499    },
    { level: 'Focused',  min: 500,  max: 1499   },
    { level: 'Elite',    min: 1500, max: 999999  },
];

const ProgressPanel = React.memo(({ tasks, stats, activityHeatmap }) => {
    const xpPoints = stats?.xp_points || 0;

    const xpData = useMemo(() => {
        const current = XP_LEVELS.find((l) => xpPoints >= l.min && xpPoints <= l.max) || XP_LEVELS[0];
        const next    = XP_LEVELS.find((l) => l.min > current.min) || null;
        const span    = Math.max(1, current.max - current.min + 1);
        const inLevel = Math.max(0, xpPoints - current.min);
        const percent = Math.min(100, Math.round((inLevel / span) * 100));
        return { current, next, percent, remaining: next ? next.min - xpPoints : 0, xpTotal: xpPoints, lvl: Math.floor(xpPoints / 500) + 1 };
    }, [xpPoints]);

    const todayData = useMemo(() => {
        const all       = tasks || [];
        const completed = all.filter((t) => t.status === 'completed').length;
        const total     = Math.max(all.length, completed, 1);
        return { completed, total, percent: Math.round((completed / total) * 100) };
    }, [tasks]);

    const heatmap = useMemo(() => {
        const days          = [];
        const now           = new Date();
        const currentStreak = stats?.current_streak || 0;
        for (let i = 6; i >= 0; i--) {
            const d        = new Date(now);
            d.setDate(now.getDate() - i);
            const iso      = d.toISOString().slice(0, 10);
            const localKey = d.toLocaleDateString('en-CA');
            let count      = 0;
            if (activityHeatmap && !Array.isArray(activityHeatmap)) {
                count = activityHeatmap[iso] ?? activityHeatmap[localKey] ?? 0;
            }
            if (count === 0) {
                count = (tasks || []).filter(
                    (t) => t.status === 'completed' && String(t.completed_at || t.updated_at || '').slice(0, 10) === iso
                ).length;
            }
            if (count === 0 && currentStreak > 0 && i < currentStreak) count = 1;
            days.push({ label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), iso, count, isToday: i === 0 });
        }
        return days;
    }, [tasks, activityHeatmap, stats]);

    const allDone = todayData.completed > 0 && todayData.completed === todayData.total;

    return (
        <div style={{
            background: 'var(--el-glass-panel)',
            border: 'var(--el-glass-border)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 24,
            padding: 20,
            boxShadow: 'var(--el-glass-shadow)',
            color: 'var(--el-text)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            height: '100%',
        }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--el-border-subtle)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--el-text-muted)', margin: 0 }}>Progress</p>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--el-text-muted)', background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)', borderRadius: 6, padding: '2px 8px' }}>
                    {xpData.xpTotal} XP
                </span>
            </div>

            {/* ── Status + Daily Focus ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)' }}>
                    <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--el-text-muted)', margin: '0 0 4px' }}>Status</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--el-text)', letterSpacing: '-0.03em' }}>{xpData.current.level}</span>
                        <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--el-text-muted)', background: 'var(--el-border)', padding: '1px 5px', borderRadius: 4 }}>Lv{xpData.lvl}</span>
                    </div>
                </div>

                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)' }}>
                    <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--el-text-muted)', margin: '0 0 4px' }}>Daily Focus</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.03em', color: allDone ? '#10b981' : 'var(--el-text)' }}>
                            {todayData.percent}%
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--el-text-muted)' }}>{todayData.completed}/{todayData.total}</span>
                    </div>
                </div>
            </div>

            {/* ── XP bar ── */}
            {xpData.next && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--el-text-muted)' }}>
                            → <span style={{ fontWeight: 600, color: 'var(--el-text-secondary)' }}>{xpData.next.level}</span>
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--el-text-secondary)' }}>{xpData.remaining} XP to go</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--el-bg-secondary)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--el-border)' }}>
                        <div style={{
                            height: '100%',
                            width: `${xpData.percent}%`,
                            background: 'var(--el-text)',
                            borderRadius: 99,
                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                        }} />
                    </div>
                </div>
            )}

            {/* ── Missions row ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10,
                background: 'var(--el-bg-secondary)',
                border: '1px solid var(--el-border)',
            }}>
                <Target style={{ width: 13, height: 13, color: allDone ? '#10b981' : 'var(--el-text-muted)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--el-text-secondary)', flex: 1 }}>Missions today</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: allDone ? '#10b981' : 'var(--el-text)' }}>
                    {todayData.completed}
                    <span style={{ fontWeight: 400, color: 'var(--el-text-muted)' }}>/{todayData.total}</span>
                </span>
            </div>

            {/* ── Activity heatmap ── */}
            <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--el-text-muted)', marginBottom: 10 }}>Activity</p>
                <div style={{ display: 'flex', gap: 5 }}>
                    {heatmap.map((day) => {
                        const opacity  = day.count === 0 ? 0 : Math.min(1, 0.2 + day.count * 0.25);
                        const isActive = day.count > 0;
                        return (
                            <div key={day.iso} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <div
                                    title={`${day.count} task${day.count !== 1 ? 's' : ''} — ${day.iso}`}
                                    style={{
                                        width: '100%',
                                        height: 26,
                                        borderRadius: 5,
                                        border: day.isToday
                                            ? '1px solid var(--el-text)'
                                            : '1px solid var(--el-border)',
                                        // Use el-text with opacity for both light + dark modes
                                        background: isActive ? 'var(--el-text)' : 'transparent',
                                        opacity: isActive ? opacity : 1,
                                        transition: 'all 0.15s',
                                    }}
                                />
                                <span style={{
                                    fontSize: 9, fontWeight: day.isToday ? 700 : 500,
                                    color: day.isToday ? 'var(--el-text)' : 'var(--el-text-muted)',
                                    textTransform: 'uppercase',
                                }}>
                                    {day.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export default ProgressPanel;
