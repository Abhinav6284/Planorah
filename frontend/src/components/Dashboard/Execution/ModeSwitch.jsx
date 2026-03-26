import React from 'react';

const ModeSwitch = ({ mode, onChange }) => {
    return (
        <div className="inline-flex items-center rounded-2xl border border-slate-300 bg-white p-1 dark:border-white/15 dark:bg-[#121212]">
            {['learning', 'exam'].map((item) => {
                const active = mode === item;
                return (
                    <button
                        key={item}
                        onClick={() => onChange(item)}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl capitalize transition-all ${active
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
