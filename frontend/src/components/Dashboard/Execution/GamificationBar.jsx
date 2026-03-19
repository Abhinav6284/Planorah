import React from 'react';

const GamificationBar = ({ stats }) => {
    const xp = stats?.xp_points || 0;
    const streak = stats?.current_streak || 0;
    const level = stats?.level || 'Beginner';
    const currentBandMax = level === 'Elite' ? 2000 : level === 'Focused' ? 1500 : 500;
    const currentBandMin = level === 'Elite' ? 1500 : level === 'Focused' ? 500 : 0;
    const progress = Math.max(0, Math.min(100, ((xp - currentBandMin) / (currentBandMax - currentBandMin || 1)) * 100));

    return (
        <div className="rounded-3xl border border-white/10 bg-[#151b24] p-4 sm:p-5 text-white">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Level {level}</p>
                <span className="text-xs text-slate-300">🔥 {streak} day streak</span>
            </div>

            <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400" style={{ width: `${progress}%` }} />
            </div>

            <div className="mt-2 text-xs text-slate-300">{xp} XP</div>
        </div>
    );
};

export default GamificationBar;
