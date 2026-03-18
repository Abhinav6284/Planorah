import React from 'react';

const ProgressChartWidget = ({ data = [] }) => {
    // Calculate last 7 days data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return {
            date: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: d,
            isToday: i === 6  // Last item in array is today
        };
    });

    const chartData = last7Days.map(dayInfo => {
        const dayTasks = data.filter(t => {
            if (!t.completed_at) return false;
            return t.completed_at.startsWith(dayInfo.date);
        });

        const completedCount = dayTasks.length;
        // Normalize to 100% for the chart height (assuming 5 tasks/day is 100% for visual)
        const value = Math.min((completedCount / 5) * 100, 100);

        return {
            day: dayInfo.day,
            value: value,
            count: completedCount,
            isToday: dayInfo.isToday
        };
    });

    // Calculate total completed this week
    const totalCompleted = chartData.reduce((a, b) => a + b.count, 0);

    // Calculate average percentage, handle zero case
    const avgValue = chartData.length > 0
        ? Math.round(chartData.reduce((a, b) => a + b.value, 0) / chartData.length)
        : 0;

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 h-full flex flex-col relative overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Progress</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {totalCompleted} task{totalCompleted !== 1 ? 's' : ''} completed
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-yellow-500">{avgValue}%</span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">avg rate</p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex items-end gap-3 min-h-[100px] px-1">
                {chartData.map((item, i) => {
                    // Show actual progress, but ensure minimum visible height
                    const displayHeight = item.value > 0 ? Math.max(item.value, 20) : 12;

                    return (
                        <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-2 group"
                        >
                            {/* Bar container */}
                            <div className="relative w-full h-full flex items-end justify-center">
                                {/* Hover tooltip */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                                        {item.count} task{item.count !== 1 ? 's' : ''}
                                    </div>
                                </div>

                                {/* The bar */}
                                <div
                                    className={`w-full max-w-[40px] rounded-lg transition-all duration-300 cursor-pointer
                                        ${item.isToday
                                            ? 'bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-md shadow-yellow-500/30'
                                            : item.count > 0
                                                ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-sm'
                                                : 'bg-gray-100 dark:bg-gray-800'
                                        }
                                        group-hover:scale-105 group-hover:shadow-lg
                                    `}
                                    style={{ height: `${displayHeight}%`, minHeight: '10px' }}
                                />
                            </div>

                            {/* Day label */}
                            <span className={`text-[10px] font-medium transition-colors
                                ${item.isToday
                                    ? 'text-yellow-500 font-bold'
                                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                }`}
                            >
                                {item.day}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 text-xs mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400" />
                    <span className="text-gray-500 dark:text-gray-400">Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                    <span className="text-gray-500 dark:text-gray-400">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
                    <span className="text-gray-500 dark:text-gray-400">No tasks</span>
                </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        </div>
    );
};

export default ProgressChartWidget;
