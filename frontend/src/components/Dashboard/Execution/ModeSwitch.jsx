import React from 'react';

const ModeSwitch = ({ mode, onChange }) => {
    return (
        <div className="inline-flex items-center rounded-2xl border border-cyan-500/20 bg-[#061a24] p-1 shadow-[0_12px_40px_rgba(0,255,245,0.08)]">
            {['learning', 'exam'].map((item) => {
                const active = mode === item;
                return (
                    <button
                        key={item}
                        onClick={() => onChange(item)}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl capitalize transition-all ${active
                            ? 'bg-cyan-400 text-[#05222e]'
                            : 'text-cyan-100/80 hover:text-cyan-100 hover:bg-cyan-500/10'
                            }`}
                    >
                        {item}
                    </button>
                );
            })}
        </div>
    );
};

export default ModeSwitch;
