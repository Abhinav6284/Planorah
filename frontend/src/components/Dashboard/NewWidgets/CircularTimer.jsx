import React from 'react';

const CircularTimer = () => {
    // Static for design matching first
    const progress = 65;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-[30px] p-6 h-full flex flex-col relative shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-500 dark:text-gray-400 text-lg font-light">Time tracker</h3>
                <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 rotate-45">
                    ↑
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* Tick marks ring */}
                    <div className="absolute inset-0 rounded-full border-[10px] border-dotted border-gray-100 dark:border-gray-700 opacity-50" />

                    {/* SVG Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r="50"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-transparent"
                        />
                        <circle
                            cx="80"
                            cy="80"
                            r="50"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="text-yellow-400 drop-shadow-lg"
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-serif text-gray-900 dark:text-white leading-none">02:35</span>
                        <span className="text-xs text-gray-400 font-medium mt-1">Work Time</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 mt-4 w-full justify-between px-4">
                    <button className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-900 dark:text-white hover:scale-110 transition-transform">
                        ▶
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                        ||
                    </button>

                    <div className="flex-1"></div>

                    <button className="w-10 h-10 rounded-full bg-gray-900 dark:bg-black flex items-center justify-center text-white">
                        ⏱
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CircularTimer;
