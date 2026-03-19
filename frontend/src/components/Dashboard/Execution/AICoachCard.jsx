import React, { useState } from 'react';

const AICoachCard = ({ coach, onRegenerate, loading }) => {
    const [showReason, setShowReason] = useState(false);

    return (
        <div className="rounded-3xl border border-white/10 bg-[#121822] p-5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">AI Coach</p>
                <button
                    onClick={onRegenerate}
                    disabled={loading}
                    className="text-xs px-3 py-1 rounded-lg border border-cyan-300/30 text-cyan-100 hover:bg-cyan-500/10 disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Regenerate सुझाव'}
                </button>
            </div>

            <h3 className="text-lg font-semibold mt-3 leading-snug">{coach?.task || 'Preparing recommendation...'}</h3>
            <p className="text-sm text-slate-300 mt-2">{coach?.estimated_time || '25 min'} · {(coach?.difficulty || 'medium').toUpperCase()}</p>

            <button
                onClick={() => setShowReason((prev) => !prev)}
                className="mt-4 text-sm text-cyan-200 hover:text-cyan-100"
            >
                {showReason ? 'Hide Why this?' : 'Why this?'}
            </button>

            {showReason && (
                <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-3">
                    <p className="text-sm text-slate-200 leading-relaxed">{coach?.reason || 'This recommendation optimizes consistency and impact.'}</p>
                </div>
            )}

            {Array.isArray(coach?.alternatives) && coach.alternatives.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Alternatives</p>
                    <div className="flex flex-wrap gap-2">
                        {coach.alternatives.map((option, idx) => (
                            <span key={`${option}-${idx}`} className="px-2 py-1 rounded-lg bg-slate-700/60 text-xs text-slate-200 border border-white/10">
                                {option}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AICoachCard;
