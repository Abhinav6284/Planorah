import React from 'react';

const difficultyStyles = {
    easy: 'bg-emerald-400/20 text-emerald-200 border-emerald-300/30',
    medium: 'bg-amber-400/20 text-amber-100 border-amber-300/40',
    hard: 'bg-rose-400/20 text-rose-100 border-rose-300/40',
};

const TodayFocusCard = ({ task, onStart, onSkip, onChangeTask }) => {
    if (!task) {
        return (
            <div className="rounded-3xl border border-cyan-500/20 bg-[#07131b] p-6 text-cyan-100">
                <p className="text-sm">Generating your task for today...</p>
            </div>
        );
    }

    const level = (task.difficulty || 'medium').toLowerCase();

    return (
        <div className="rounded-3xl border border-cyan-400/20 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.2),transparent_40%),linear-gradient(140deg,#07131b,#0d1f2b_55%,#10212a)] p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/70 mb-3">Today Focus</p>
            <h2 className="text-xl sm:text-2xl font-semibold text-white leading-snug">{task.title}</h2>

            <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-cyan-50">{task.estimated_time || '25 min'}</span>
                <span className={`px-3 py-1 rounded-full border text-xs ${difficultyStyles[level] || difficultyStyles.medium}`}>
                    {level}
                </span>
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-black/20 p-3">
                <p className="text-[11px] uppercase tracking-wide text-cyan-200/70">Why this task?</p>
                <p className="text-sm text-slate-100 mt-1 leading-relaxed">{task.reason || 'This task is selected for momentum and consistency.'}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                <button
                    onClick={onStart}
                    className="px-4 py-2 rounded-xl bg-cyan-300 text-[#062231] text-sm font-bold hover:bg-cyan-200 transition-colors"
                >
                    Start Now
                </button>
                <button
                    onClick={onSkip}
                    className="px-4 py-2 rounded-xl border border-white/20 text-white/85 text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                    Skip
                </button>
                <button
                    onClick={onChangeTask}
                    className="px-4 py-2 rounded-xl border border-cyan-300/40 text-cyan-100 text-sm font-semibold hover:bg-cyan-500/10 transition-colors"
                >
                    Change Task
                </button>
            </div>
        </div>
    );
};

export default TodayFocusCard;
