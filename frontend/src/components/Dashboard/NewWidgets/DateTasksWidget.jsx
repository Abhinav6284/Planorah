import React from 'react';
import { Link } from 'react-router-dom';

const DateTasksWidget = ({ tasks = [] }) => {
    const today = new Date();
    const dayNum = today.getDate();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });

    const todayTasks = tasks.filter(t => {
        const taskDate = new Date(t.due_date);
        return taskDate.toDateString() === today.toDateString();
    });
    const pendingTasks = todayTasks.filter(t => t.status !== 'completed').length;

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] px-4 sm:px-5 py-4 h-full flex items-center gap-3 sm:gap-4 border border-gray-100 dark:border-gray-800 shadow-sm">
            {/* Large Date Number */}
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dayNum}</span>
                </div>
                <div className="text-left">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{dayName},</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{monthName}</p>
                </div>
            </div>

            {/* Divider - Hidden on very small screens */}
            <div className="hidden sm:block h-10 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Show Tasks Button */}
            <Link
                to="/tasks"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs sm:text-sm font-medium transition-all hover:scale-105 flex-shrink-0"
            >
                <span>Show my Tasks</span>
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </Link>

            {/* Calendar Button */}
            <Link
                to="/scheduler"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
            >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </Link>

            {/* Task Count Badge - Only if pending tasks */}
            {pendingTasks > 0 && (
                <div className="hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400">{pendingTasks}</span>
                </div>
            )}
        </div>
    );
};

export default DateTasksWidget;
