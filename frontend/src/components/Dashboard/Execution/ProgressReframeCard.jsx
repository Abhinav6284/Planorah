import React from 'react';

const ProgressReframeCard = ({ stats, weeklyCompleted }) => {
    const completed = stats?.tasks_completed || 0;

    let message = 'Start your first mission 🚀';
    let tone = 'text-cyan-200';

    if (completed > 0 && completed < 10) {
        message = "You're getting momentum 💪";
        tone = 'text-amber-200';
    }

    if (completed >= 10) {
        message = "You're on fire 🔥";
        tone = 'text-rose-200';
    }

    return (
        <div className="rounded-3xl border border-cyan-400/20 bg-[#09131b] p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Progress</p>
            <h3 className={`mt-2 text-xl font-semibold ${tone}`}>{message}</h3>
            <p className="text-sm text-slate-300 mt-2">{completed} tasks completed overall</p>
            <p className="text-xs text-slate-400 mt-1">{weeklyCompleted || 0} done in the last 7 days</p>
        </div>
    );
};

export default ProgressReframeCard;
