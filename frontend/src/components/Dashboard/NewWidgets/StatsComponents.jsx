import React from 'react';

export const StatsPills = () => {
    return (
        <div className="flex flex-wrap gap-4 items-center">
            {/* Dark Pill */}
            <div className="bg-[#1C1C1E] text-white px-5 py-3 rounded-[20px] flex flex-col justify-center min-w-[80px]">
                <span className="text-xs text-gray-400 mb-1">Attendance</span>
                <span className="font-bold">85%</span>
            </div>

            {/* Yellow Pill */}
            <div className="bg-[#FCD34D] text-black px-5 py-3 rounded-[20px] flex flex-col justify-center min-w-[80px]">
                <span className="text-xs text-gray-800 mb-1">Efficiency</span>
                <span className="font-bold">92%</span>
            </div>

            {/* Transparent/Stroke Pills? Just text in screenshot maybe with background */}
            <div className="px-5 py-3 flex flex-col justify-center">
                <span className="text-xs text-gray-500 mb-1">Study Focus</span>
                <span className="font-bold text-gray-900 dark:text-gray-300">60%</span>
                {/* Stripe pattern background in screenshot is complex, simplifying */}
                <div className="w-24 h-2 mt-1 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqd4AykD4QA7IJEgdwAAAnO0LhQ51O8gAAAAASUVORK5CYII=')] opacity-20"></div>
            </div>

            <div className="px-5 py-3 flex flex-col border border-gray-300 rounded-[20px] ml-auto">
                <span className="text-xs text-gray-500 mb-1">Completion</span>
                <span className="font-bold text-gray-900 dark:text-gray-300">100%</span>
            </div>
        </div>
    );
};

export const StatsDigits = ({ stats }) => {
    return (
        <div className="flex gap-8 items-end">
            <div className="text-center">
                <div className="text-4xl font-serif font-light text-gray-900 dark:text-white">78</div>
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    🔥 Day Streak
                </div>
            </div>
            <div className="text-center">
                <div className="text-4xl font-serif font-light text-gray-900 dark:text-white">56</div>
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    ✅ Tasks Done
                </div>
            </div>
            <div className="text-center">
                <div className="text-4xl font-serif font-light text-gray-900 dark:text-white">203</div>
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    ⏱️ Study Hours
                </div>
            </div>
        </div>
    );
};
