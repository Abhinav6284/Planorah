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
        <div className="rounded-2xl border-0 bg-white dark:bg-[#1a1a1a] p-6 shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 space-y-5">
            {/* Header: Level + XP + Focus */}
            <div className="flex items-end justify-between pb-4 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Level</p>
                        <p className="text-xl font-bold text-gray-950 dark:text-white">{xpData.current.level}</p>
                    </div>
                    <div className="border-l border-gray-200 dark:border-white/10 pl-4">
                        <p className="text-xs text-gray-600 dark:text-gray-400">XP</p>
                        <p className="text-lg font-bold text-terracotta">{xpData.xpTotal}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Focus</p>
                    <p className="text-2xl font-bold text-gray-950 dark:text-white">{todayData.percent}%</p>
                </div>
            </div>

            {/* XP Progress Bar */}
            {xpData.next && (
                <div>
                    <div className="flex justify-between text-xs mb-2 text-gray-600 dark:text-gray-400">
                        <span>→ {xpData.next.level}</span>
                        <span className="text-terracotta font-semibold">{xpData.remaining} XP</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-terracotta transition-all duration-500"
                            style={{ width: `${xpData.percent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Missions Info */}
            <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-950 dark:text-white">{todayData.completed}/{todayData.total}</span> missions completed
            </p>

            {/* Weekly Heatmap */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Consistency</p>
                <div className="flex justify-between gap-2">
                    {heatmap.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <div
                                title={`${day.count} task${day.count !== 1 ? 's' : ''} on ${day.iso}`}
                                className={`w-full h-6 rounded-md transition-all ${day.count > 0
                                        ? `bg-terracotta ${day.count > 2 ? 'opacity-100' : 'opacity-60'}`
                                        : 'bg-gray-200 dark:bg-white/10'
                                    }`}
                            />
                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{day.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default ProgressPanel;
