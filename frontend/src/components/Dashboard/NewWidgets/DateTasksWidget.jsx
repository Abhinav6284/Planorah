import React from 'react';
import { Link } from 'react-router-dom';

const DateTasksWidget = ({ tasks = [] }) => {
    const today = new Date();
    const dayNum = today.getDate();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });

    const todayIso = today.toLocaleDateString('en-CA');
    const todaysTasks = tasks.filter((task) => task.due_date === todayIso);
    const completedToday = todaysTasks.filter((task) => task.status === 'completed').length;

    return (
        <div className="inline-flex max-w-full flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/75 px-3 py-2.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-950/45">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-200 bg-gradient-to-b from-cyan-50 to-white text-center dark:border-cyan-400/20 dark:from-cyan-400/10 dark:to-slate-900">
                <span className="text-xl font-semibold leading-none text-slate-900 dark:text-white">{dayNum}</span>
            </div>

            <div className="min-w-[90px] text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{dayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{monthName}</p>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />

            <div className="rounded-xl bg-cyan-50/80 px-2.5 py-1.5 text-center dark:bg-cyan-500/10">
                <p className="text-[10px] uppercase tracking-wide text-cyan-700 dark:text-cyan-300">Today</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{completedToday}/{todaysTasks.length}</p>
            </div>

            <Link
                to="/scheduler"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white/80 text-slate-600 transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:text-cyan-200"
                title="Open calendar"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </Link>
        </div>
    );
};

export default DateTasksWidget;
