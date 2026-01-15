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

    // Calculate average, handle zero case
    const avgValue = chartData.length > 0
        ? Math.round(chartData.reduce((a, b) => a + b.value, 0) / chartData.length)
        : 0;

    // Handle maxValue being 0 to prevent NaN in height calculation
    const maxValue = Math.max(...chartData.map(d => d.value), 1);

    return (
        <div className="bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white rounded-[28px] p-5 h-full flex flex-col relative overflow-hidden border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Progress</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Task completion rate</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-500">
                        {avgValue}%
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 flex items-end gap-2 pb-6 relative min-h-[80px]">
                {chartData.map((item, i) => {
                    const height = maxValue > 0 ? Math.max((item.value / maxValue) * 100, 15) : 15;

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div
                                className={`w-full rounded-xl transition-all duration-500 ${item.isToday
                                        ? 'bg-yellow-400'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                style={{ height: `${height}%`, minHeight: '16px' }}
                            />
                            <span className={`text-[10px] font-medium ${item.isToday
                                    ? 'text-yellow-500 font-bold'
                                    : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                {item.day}
                            </span>
                        </div>
                    );
                })}

                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="border-t border-gray-100 dark:border-gray-800 w-full" />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="text-gray-500 dark:text-gray-400">Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <span className="text-gray-500 dark:text-gray-400">This week</span>
                </div>
            </div>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        </div>
    );
};

export default ProgressChartWidget;
