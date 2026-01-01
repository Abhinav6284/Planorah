import React from 'react';
import { Link } from 'react-router-dom';

const DateTasksWidget = ({ tasks = [] }) => {
    const today = new Date();
    const dayNum = today.getDate();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-full px-4 sm:px-6 py-3 h-full flex items-center gap-4 border border-gray-100 dark:border-gray-800 shadow-sm">
            {/* Date Circle */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{dayNum}</span>
            </div>

            {/* Day & Month */}
            <div className="text-left">
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{dayName},</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{monthName}</p>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Arrow Button - Links to tasks */}
            <Link
                to="/tasks"
                className="flex items-center justify-center w-24 sm:w-28 h-9 sm:h-10 bg-orange-500 hover:bg-orange-600 rounded-full transition-all hover:scale-105"
            >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </Link>

            {/* Calendar Button */}
            <Link
                to="/scheduler"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
            >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </Link>
        </div>
    );
};

export default DateTasksWidget;
