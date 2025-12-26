import React from 'react';

const ActivityChart = ({ data }) => {
    // Mock data if none provided
    const chartData = data || [
        { day: 'S', value: 30, active: false },
        { day: 'M', value: 60, active: false },
        { day: 'T', value: 45, active: false },
        { day: 'W', value: 80, active: false },
        { day: 'T', value: 100, active: true }, // Current day or highest
        { day: 'F', value: 20, active: false },
        { day: 'S', value: 10, active: false },
    ];

    const currentDay = "T"; // Mock current day

    return (
        <div className="bg-white dark:bg-gray-800 rounded-[30px] p-6 h-full flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-lg font-light">Progress</h3>
                    <div className="mt-1">
                        <span className="text-4xl font-serif text-gray-900 dark:text-white block">6.1 h</span>
                        <span className="text-xs text-gray-400 font-medium">Study Time this week</span>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 rotate-45">
                    ↑
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex justify-between items-end h-32 mt-4 px-2">
                {chartData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-3 group w-full">
                        <div className="relative w-2 bg-gray-100 dark:bg-gray-700 rounded-full h-full flex items-end overflow-visible">
                            {/* Floating Label for Active */}
                            {item.active && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-300 text-black text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap z-10">
                                    5h 23m
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-300 rotate-45"></div>
                                </div>
                            )}

                            {/* Bar */}
                            <div
                                style={{ height: `${item.value}%` }}
                                className={`w-full rounded-full transition-all duration-500 ${item.active ? 'bg-yellow-400 shadow-lg shadow-yellow-400/30' : 'bg-gray-800 dark:bg-gray-500 group-hover:bg-gray-600'}`}
                            ></div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{item.day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityChart;
