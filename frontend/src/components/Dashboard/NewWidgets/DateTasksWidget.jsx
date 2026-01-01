import React from 'react';
import { Link } from 'react-router-dom';

const DateTasksWidget = ({ tasks = [] }) => {
    const today = new Date();
    const dayNum = today.getDate();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });

    return (
        <div className="bg-transparent px-2 py-3 h-full flex items-center gap-4">
            {/* Date Circle */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{dayNum}</span>
            </div>

            {/* Day & Month */}
            <div className="text-left">
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{dayName},</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{monthName}</p>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

            {/* Calendar Button */}
            <Link
                to="/scheduler"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
            >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </Link>
        </div>
    );
};

export default DateTasksWidget;
