import React from 'react';

const OnboardingWidget = () => {
    return (
        <div className="bg-[#FFFFF0] dark:bg-gray-800 rounded-[30px] p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <h3 className="text-gray-500 dark:text-gray-400 text-lg font-light">Onboarding</h3>
                <span className="text-3xl font-serif text-gray-900 dark:text-white">18%</span>
            </div>

            <div className="flex gap-2 text-xs text-gray-400 mt-2 font-mono">
                <div className="w-1/3">30%</div>
                <div className="w-1/3">25%</div>
                <div className="w-1/3 text-right">0%</div>
            </div>

            <div className="flex items-center gap-2 mt-2 h-16">
                {/* Yellow "Task" Pill */}
                <div className="h-12 flex-1 bg-[#FCD34D] rounded-2xl flex items-center justify-center text-gray-900 font-medium text-sm shadow-sm hover:scale-105 transition-transform cursor-pointer">
                    Task
                </div>

                {/* Dark Pill */}
                <div className="h-12 w-16 bg-[#1C1C1E] rounded-2xl shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>

                {/* Gray Pill */}
                <div className="h-12 w-12 bg-gray-400 rounded-2xl opacity-50"></div>
            </div>

            {/* Decorative bottom element matching screenshot if any? Just the pills usually. */}
        </div>
    );
};

export default OnboardingWidget;
