import { useMemo } from 'react';

const XP_LEVELS = [
    { level: 'Beginner', min: 0, max: 499 },
    { level: 'Focused', min: 500, max: 1499 },
    { level: 'Elite', min: 1500, max: 999999 },
];

const ProgressPanel = ({ tasks, stats }) => {
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
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const iso = d.toISOString().slice(0, 10);
            const count = (tasks || []).filter(t =>
                t.status === 'completed' &&
                String(t.completed_at || t.updated_at || '').slice(0, 10) === iso
            ).length;

            days.push({
                label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                count
            });
        }
        return days;
    }, [tasks]);

    return (
        <div className="space-y-5">
            {/* Level Card */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 shadow-soft dark:shadow-none">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-xs font-bold text-terracotta/80 uppercase tracking-wider mb-2">⚡ Your Level</p>
                        <p className="text-4xl font-bold text-gray-950 dark:text-white">{xpData.current.level}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total XP</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-terracotta to-orange-400 bg-clip-text text-transparent">
                            {xpData.xpTotal}
                        </p>
                    </div>
                </div>

                {xpData.next && (
                    <div>
                        <div className="flex justify-between text-xs mb-2.5 text-gray-600 dark:text-gray-400">
                            <span>Progress to {xpData.next.level}</span>
                            <span className="text-terracotta">{xpData.remaining} XP left</span>
                        </div>
                        <div className="h-2.5 bg-borderMuted dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-terracotta to-orange-400 transition-all duration-500"
                                style={{ width: `${xpData.percent}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Today's Focus */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 shadow-soft dark:shadow-none">
                <p className="text-xs font-bold text-terracotta/80 uppercase tracking-wider mb-5">📊 Today's Focus</p>
                <div className="text-center">
                    <p className="text-6xl font-bold bg-gradient-to-r from-terracotta to-orange-400 bg-clip-text text-transparent mb-2">
                        {todayData.percent}%
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        <span className="text-gray-950 dark:text-white font-bold">{todayData.completed}/{todayData.total}</span> missions completed
                    </p>
                </div>
            </div>

            {/* Weekly Heatmap */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 shadow-soft dark:shadow-none">
                <p className="text-xs font-bold text-terracotta/80 uppercase tracking-wider mb-5">🔥 Weekly Consistency</p>
                <div className="flex justify-between gap-2.5">
                    {heatmap.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2.5">
                            <div
                                className={`w-full h-10 rounded-lg transition-all ${day.count > 0
                                        ? `bg-gradient-to-br from-terracotta to-orange-500 ${day.count > 2 ? 'opacity-100 shadow-lg shadow-terracotta/30' : 'opacity-70'}`
                                        : 'bg-borderMuted dark:bg-white/10'
                                    }`}
                            />
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{day.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProgressPanel;
