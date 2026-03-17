import React from 'react';

const QuickStatsWidget = ({ tasks = [] }) => {
    const totalCompleted = tasks.filter((task) => task.status === 'completed').length;
    const totalPending = tasks.filter((task) => task.status !== 'completed').length;
    const uniqueRoadmaps = new Set(tasks.map((task) => task.roadmap_title).filter(Boolean)).size;

    const statItems = [
        {
            label: 'Done',
            value: totalCompleted,
            chip: '✓',
            chipClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
        },
        {
            label: 'Pending',
            value: totalPending,
            chip: '•',
            chipClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
        },
        {
            label: 'Paths',
            value: uniqueRoadmaps,
            chip: '◈',
            chipClass: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
        }
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {statItems.map((item) => (
                <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 dark:border-white/10 dark:bg-slate-950/45 dark:hover:border-cyan-400/25"
                >
                    <div className="mb-2 flex items-center justify-between">
                        <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${item.chipClass}`}>
                            {item.chip}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</span>
                    </div>
                    <p className="text-xl font-semibold leading-none text-slate-900 dark:text-white">{item.value}</p>
                </div>
            ))}
        </div>
    );
};

export default QuickStatsWidget;
