import React, { useMemo } from 'react';
import { Zap } from 'lucide-react';

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

        return { current, next, percent, remaining: next ? next.min - xpPoints : 0 };
    }, [xpPoints]);

    // Today Circular Logic
    const todayData = useMemo(() => {
        const todayISO = new Date().toISOString().slice(0, 10);
        const todayTasks = (tasks || []).filter(t => String(t.scheduled_for || '').slice(0, 10) === todayISO);
        const completed = todayTasks.filter(t => t.status === 'completed').length;
        const total = Math.max(todayTasks.length, 1);
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
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (todayData.percent / 100) * circumference;

    return (
        <div className="space-y-4">
            {/* Today Progress */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#121212]">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Focus</h3>
                <div className="flex items-center gap-5">
                    <div className="relative h-20 w-20">
                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="6" className="stroke-slate-100 dark:stroke-white/10" />
                            <circle
                                cx="40" cy="40" r={radius} fill="none" strokeWidth="6"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                className="stroke-blue-600 transition-all duration-1000 dark:stroke-white"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{todayData.percent}%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {todayData.completed}<span className="text-slate-400">/{todayData.total}</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Missions completed</p>
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#121212]">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Weekly Consistency</h3>
                <div className="flex justify-between gap-1">
                    {heatmap.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div
                                className={`h-8 w-full rounded-md transition-colors ${day.count > 0
                                        ? `bg-emerald-500 ${day.count > 2 ? 'opacity-100' : 'opacity-70'}`
                                        : 'bg-slate-100 dark:bg-white/5'
                                    }`}
                                style={{ width: '100%' }}
                            />
                            <span className="text-[10px] font-medium text-slate-400">{day.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* XP Level */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#121212]">
                <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-white">
                        <Zap className="h-4 w-4 fill-amber-400 text-amber-500" />
                        {xpData.current.level}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {xpPoints} XP
                    </span>
                </div>

                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                        className="absolute left-0 top-0 h-full bg-amber-500 transition-all duration-1000"
                        style={{ width: `${xpData.percent}%` }}
                    />
                </div>

                {xpData.next && (
                    <p className="mt-2 text-right text-[10px] text-slate-400">
                        {xpData.remaining} XP to {xpData.next.level}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProgressPanel;
