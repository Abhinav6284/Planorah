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
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 h-full flex items-center gap-4 border border-gray-100 dark:border-gray-800 shadow-sm">
            {/* Large Date Number */}
            <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{dayNum}</span>
                </div>
                <div className="text-left">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{dayName},</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{monthName}</p>
                </div>
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Show Tasks Button */}
            <Link
                to="/tasks"
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-medium transition-colors"
            >
                <span>Show my Tasks</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </Link>

            {/* Task Count Badge */}
            {pendingTasks > 0 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{pendingTasks}</span>
                </div>
            )}
        </div>
    );
};

export default DateTasksWidget;
