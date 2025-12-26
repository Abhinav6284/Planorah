import React from 'react';

const ProgressChartWidget = ({ data = [] }) => {
    // Sample data if none provided
    // Calculate last 7 days data
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            date: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: d
        };
    });

    const chartData = last7Days.map(dayInfo => {
        const dayTasks = data.filter(t => {
            if (!t.completed_at) return false;
            return t.completed_at.startsWith(dayInfo.date);
        });

        // Calculate completion value (e.g., number of completed tasks or percentage of daily goal)
        // Here we'll use a simple count capped at 5 for visual scaling, or percentage if total > 0
        // For a "Completion Rate" chart, we need total tasks for that day vs completed.
        // Since we only have current tasks, let's just show "Tasks Completed" count for now
        // OR we can show "Productivity Score" based on actual_minutes

        const completedCount = dayTasks.length;
        // Normalize to 100% for the chart height (assuming 5 tasks/day is 100% for visual)
        const value = Math.min((completedCount / 5) * 100, 100);

        return {
            day: dayInfo.day,
            value: value,
            count: completedCount
        };
    });

    const maxValue = Math.max(...chartData.map(d => d.value));

    return (
        <div className="bg-[#1C1C1E] text-white rounded-[28px] p-5 h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-medium">Weekly Progress</h3>
                    <p className="text-xs opacity-50 mt-0.5">Task completion rate</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-400">
                        {Math.round(chartData.reduce((a, b) => a + b.value, 0) / chartData.length)}%
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 flex items-end gap-2 pb-6 relative">
                {chartData.map((item, i) => {
                    const height = (item.value / maxValue) * 100;
                    const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div
                                className={`w-full rounded-xl transition-all duration-500 ${isToday
                                    ? 'bg-gradient-to-t from-yellow-500 to-yellow-400'
                                    : 'bg-gradient-to-t from-white/20 to-white/10'
                                    }`}
                                style={{ height: `${height}%`, minHeight: '20px' }}
                            />
                            <span className={`text-[10px] ${isToday ? 'text-yellow-400 font-bold' : 'opacity-40'}`}>
                                {item.day}
                            </span>
                        </div>
                    );
                })}

                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="border-t border-white/5 w-full" />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="opacity-50">Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <span className="opacity-50">This week</span>
                </div>
            </div>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        </div>
    );
};

export default ProgressChartWidget;
