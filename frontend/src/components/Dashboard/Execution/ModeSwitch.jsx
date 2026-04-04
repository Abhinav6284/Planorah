import React from 'react';

const ModeSwitch = ({ mode, onChange }) => {
    return (
        <div className="inline-flex items-center rounded-xl border border-borderMuted/60 bg-white/50 p-1 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            {['learning', 'exam'].map((item) => {
                const active = mode === item;
                return (
                    <button
                        key={item}
                        onClick={() => onChange(item)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-all sm:text-[13px] ${active
                            ? 'bg-gradient-to-br from-terracotta to-terracottaHover text-white shadow-lg shadow-terracotta/30 dark:shadow-terracotta/20'
                            : 'text-textSecondary hover:text-textPrimary hover:bg-beigeMuted/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
                            }`}
                    >
                        {item}
                    </button>
                );
            })}
        </div>
    );
};

export default React.memo(ModeSwitch);
