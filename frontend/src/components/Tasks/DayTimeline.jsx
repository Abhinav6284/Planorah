import React, { useState, useEffect, useCallback } from 'react';
import { tasksService } from '../../api/tasksService';
import { motion } from 'framer-motion';
import { format, addDays, startOfToday } from 'date-fns';

export default function DayTimeline() {
    const [tasks, setTasks] = useState([]);
    const [selectedDay, setSelectedDay] = useState(1);
    const [loading, setLoading] = useState(true);
    const fetchDayTasks = useCallback(async () => {
        try {
            const response = await tasksService.getTasksByDay(selectedDay);
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch day tasks:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedDay]);

    useEffect(() => {
        fetchDayTasks();
    }, [selectedDay, fetchDayTasks]);

    const completeTask = async (taskId) => {
        try {
            await tasksService.completeTask(taskId);
            fetchDayTasks();
        } catch (error) {
            console.error('Failed to complete task:', error);
        }
    };

    const reschedule = async (taskId, newDay) => {
        try {
            const newDate = format(addDays(startOfToday(), newDay - 1), 'yyyy-MM-dd');
            await tasksService.rescheduleTask(taskId, newDay, newDate);
            fetchDayTasks();
        } catch (error) {
            console.error('Failed to reschedule task:', error);
        }
    };

    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const dayProgress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 md:p-10">
                <header className="mb-8">
                    <h1 className="text-3xl font-serif font-medium text-gray-900 dark:text-white mb-2">Day Timeline</h1>
                    <p className="text-gray-500 dark:text-gray-400">Focus on one day at a time</p>
                </header>

                {/* Day Selector */}
                <div className="mb-8 overflow-x-auto">
                    <div className="flex gap-2 pb-4">
                        {[...Array(30)].map((_, i) => {
                            const day = i + 1;
                            const isSelected = day === selectedDay;
                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`flex-shrink-0 w-16 h-20 rounded-xl font-medium transition-all ${isSelected
                                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-110'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="text-xs opacity-60">Day</div>
                                    <div className="text-2xl font-bold">{day}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Day Progress */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Day {selectedDay} Progress</h3>
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${dayProgress}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {completedCount} of {tasks.length} tasks completed
                    </p>
                </div>

                {/* Tasks for the Day */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
                            <p className="text-gray-400">Loading tasks...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
                            <p className="text-gray-400">No tasks scheduled for this day</p>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={() => completeTask(task.id)}
                                        className="mt-1"
                                    >
                                        {task.status === 'completed' ? (
                                            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                                        )}
                                    </button>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => reschedule(task.id, selectedDay + 1)}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Move to tomorrow
                                            </button>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">⏱️ {task.estimated_minutes}min</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
