import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const XP_LEVELS = [
    { level: 'Beginner', min: 0, max: 499 },
    { level: 'Focused', min: 500, max: 1499 },
    { level: 'Elite', min: 1500, max: 999999 },
];

const ProgressPanel = ({ tasks, stats }) => {
    const xpPoints = stats?.xp_points || 0;

    // XP Logic
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

    // Today Circular Logic — count all completed tasks vs total missions
    const todayData = useMemo(() => {
        const allTasks = tasks || [];
        const completed = allTasks.filter(t => t.status === 'completed').length;
        const total = Math.max(allTasks.length, completed, 1);
        const percent = Math.round((completed / total) * 100);

        return { completed, total, percent };
    }, [tasks]);

    // Heatmap Logic
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

    // Circular ring calc
    const ringSize = 72;
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (todayData.percent / 100) * circumference;
    const center = ringSize / 2;

    return (
        <div className="space-y-6">
            {/* XP Progress Card */}
            <div className="rounded-2xl border border-borderMuted/50 bg-gradient-to-br from-white/80 to-beigePrimary/40 backdrop-blur-xl p-5 shadow-soft dark:border-white/5 dark:bg-gradient-to-br dark:from-[#1a1a1a]/80 dark:to-[#0f0f0f]/80 dark:shadow-darkSoft">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-terracotta dark:text-terracotta/80">Your Level</h3>
                        <p className="mt-2 text-2xl font-bold text-textPrimary dark:text-white">
                            ⚡ {xpData.current.level}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-textSecondary dark:text-slate-400">Total XP</p>
                        <p className="text-lg font-bold text-textPrimary dark:text-white">{xpData.xpTotal}</p>
                    </div>
                </div>

                {xpData.next && (
                    <>
                        <div className="mb-3 flex items-center justify-between text-xs">
                            <span className="font-medium text-textSecondary dark:text-slate-400">
                                Progress to {xpData.next.level}
                            </span>
                            <span className="font-bold text-textPrimary dark:text-slate-200">
                                {xpData.remaining} XP left
                            </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-beigeMuted/60 dark:bg-white/10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${xpData.percent}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-terracotta to-terracottaHover shadow-lg shadow-terracotta/30 dark:from-terracotta dark:to-terracotta/80"
                            />
                        </div>
                        <p className="mt-2.5 text-xs text-textSecondary dark:text-slate-400">
                            {xpData.xpInCurrentLevel} / {xpData.next.min - xpData.current.min} XP in current level
                        </p>
                    </>
                )}

                {!xpData.next && (
                    <div className="rounded-xl bg-gradient-to-r from-terracotta/20 to-sage/20 p-4 text-center dark:from-terracotta/10 dark:to-sage/10">
                        <p className="text-sm font-bold text-terracotta dark:text-terracotta/80">
                            🎖️ Max Level Reached!
                        </p>
                    </div>
                )}
            </div>

            {/* Today Progress */}
            <div className="rounded-2xl border border-borderMuted/50 bg-gradient-to-br from-white/80 to-beigePrimary/40 backdrop-blur-xl p-5 shadow-soft dark:border-white/5 dark:bg-gradient-to-br dark:from-[#1a1a1a]/80 dark:to-[#0f0f0f]/80 dark:shadow-darkSoft">
                <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-terracotta dark:text-terracotta/80">Today's Focus</h3>
                <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16">
                        <svg className="h-full w-full -rotate-90 transform" viewBox={`0 0 ${ringSize} ${ringSize}`}>
                            <circle cx={center} cy={center} r={radius} fill="none" strokeWidth="6" className="stroke-beigeMuted dark:stroke-white/10" />
                            <circle
                                cx={center} cy={center} r={radius} fill="none" strokeWidth="6"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                className="stroke-terracotta transition-all duration-1000 dark:stroke-terracotta"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-textPrimary dark:text-white">{todayData.percent}%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-textPrimary dark:text-white">
                            {todayData.completed}<span className="text-textSecondary dark:text-slate-400">/{todayData.total}</span>
                        </p>
                        <p className="text-xs text-textSecondary dark:text-slate-400">Missions completed</p>
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <div className="rounded-2xl border border-borderMuted/50 bg-gradient-to-br from-white/80 to-beigePrimary/40 backdrop-blur-xl p-5 shadow-soft dark:border-white/5 dark:bg-gradient-to-br dark:from-[#1a1a1a]/80 dark:to-[#0f0f0f]/80 dark:shadow-darkSoft">
                <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-terracotta dark:text-terracotta/80">Weekly Consistency</h3>
                <div className="flex justify-between gap-1">
                    {heatmap.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div
                                className={`h-7 w-full rounded-md transition-colors ${day.count > 0
                                        ? `bg-gradient-to-br from-terracotta to-terracottaHover ${day.count > 2 ? 'opacity-100' : 'opacity-70'}`
                                        : 'bg-beigeMuted/50 dark:bg-white/5'
                                    }`}
                                style={{ width: '100%' }}
                            />
                            <span className="text-[10px] font-medium text-textSecondary dark:text-slate-400">{day.label}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ProgressPanel;
