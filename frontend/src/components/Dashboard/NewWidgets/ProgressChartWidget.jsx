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
        <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] text-white rounded-[28px] p-5 h-full flex flex-col relative overflow-hidden border border-white/5 shadow-2xl">
            {/* Animated Background Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/10 via-indigo-500/5 to-transparent rounded-full blur-2xl -ml-10 -mb-10"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <div>
                    <h3 className="text-base font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                        Weekly Progress
                    </h3>
                    <p className="text-xs text-white/40 mt-1 font-medium tracking-wide">Task completion rate</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur-lg opacity-40"></div>
                        <span className="relative text-3xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
                            {avgValue}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 flex items-end gap-2.5 pb-7 relative z-10 min-h-[100px]">
                {chartData.map((item, i) => {
                    const height = maxValue > 0 ? Math.max((item.value / maxValue) * 100, 8) : 8;

                    return (
                        <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            {/* Tooltip on hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium border border-white/10 whitespace-nowrap z-20">
                                {item.count} task{item.count !== 1 ? 's' : ''} completed
                            </div>

                            <div className="relative w-full h-full flex items-end justify-center">
                                {/* Bar glow effect for today */}
                                {item.isToday && (
                                    <div
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-amber-400/30 to-transparent rounded-2xl blur-md"
                                        style={{ height: `${height + 10}%` }}
                                    />
                                )}

                                <div
                                    className={`w-full rounded-2xl transition-all duration-500 ease-out group-hover:scale-105 ${item.isToday
                                            ? 'bg-gradient-to-t from-amber-500 via-yellow-400 to-amber-300 shadow-lg shadow-amber-500/30'
                                            : 'bg-gradient-to-t from-white/15 via-white/10 to-white/5 group-hover:from-white/25 group-hover:via-white/15 group-hover:to-white/10'
                                        }`}
                                    style={{ height: `${height}%`, minHeight: '16px' }}
                                />
                            </div>

                            <span className={`text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 ${item.isToday
                                    ? 'text-amber-400 scale-110'
                                    : 'text-white/35 group-hover:text-white/60'
                                }`}>
                                {item.day}
                            </span>
                        </div>
                    );
                })}

                {/* Subtle grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-7 pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="border-t border-white/[0.03] w-full" />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs mt-3 relative z-10">
                <div className="flex items-center gap-2 group cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 shadow-md shadow-amber-500/30 group-hover:scale-125 transition-transform duration-300" />
                    <span className="text-white/50 font-medium group-hover:text-white/70 transition-colors">Today</span>
                </div>
                <div className="flex items-center gap-2 group cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-white/20 to-white/10 group-hover:scale-125 transition-transform duration-300" />
                    <span className="text-white/50 font-medium group-hover:text-white/70 transition-colors">This week</span>
                </div>
            </div>

            {/* Glass reflection effect */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.02] to-transparent rounded-t-[28px] pointer-events-none"></div>
        </div>
    );
};

export default ProgressChartWidget;
