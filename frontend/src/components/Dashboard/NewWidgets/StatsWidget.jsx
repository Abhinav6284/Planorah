import React from 'react';

const StatsWidget = ({ completed = 0, pending = 0 }) => {
    const total = completed + pending;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="bg-[#1C1C1E] text-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-medium opacity-60">Task Overview</h3>
                <span className="text-[10px] sm:text-xs px-2 py-1 bg-white/10 rounded-full">{completionRate}%</span>
            </div>

            {/* Stats Grid */}
            <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4">
                {/* Completed */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between border border-emerald-500/20">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{completed}</div>
                        <div className="text-[10px] sm:text-xs opacity-50 mt-0.5 sm:mt-1">Completed</div>
                    </div>
                </div>

                {/* Pending */}
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between border border-amber-500/20">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-bold text-amber-400">{pending}</div>
                        <div className="text-[10px] sm:text-xs opacity-50 mt-0.5 sm:mt-1">Pending</div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 sm:mt-4">
                <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                    />
                </div>
            </div>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full blur-2xl -mr-8 sm:-mr-10 -mt-8 sm:-mt-10"></div>
        </div>
    );
};

export default StatsWidget;
