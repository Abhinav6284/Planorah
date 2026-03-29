import React from 'react';

const ModeSwitch = ({ mode, onChange }) => {
    return (
        <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white p-0.5 dark:border-white/15 dark:bg-[#121212]">
            {['learning', 'exam'].map((item) => {
                const active = mode === item;
                return (
                    <button
                        key={item}
                        onClick={() => onChange(item)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all sm:text-[13px] ${active
                            ? 'bg-blue-100 text-blue-700 dark:bg-white dark:text-black'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
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
