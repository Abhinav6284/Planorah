import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TaskSchedulerWidget = ({ tasks = [] }) => {
    // Generate dates
    const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            date: d,
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: d.getDate(),
            // Store as YYYY-MM-DD for easier comparison with backend due_date
            isoDate: d.toLocaleDateString('en-CA') // outputs YYYY-MM-DD in most locales, strictly year-month-day
        };
    });

    const [selectedDate, setSelectedDate] = useState(days[0].isoDate);

    // Filter tasks for selected date using real backend data
    // Filter tasks for selected date using real backend data
    const currentTasks = tasks.filter(task => task.due_date === selectedDate);
    const completedCount = currentTasks.filter(t => t.status === 'completed').length;

    return (
        <div className="bg-white dark:bg-black text-gray-900 dark:text-white rounded-[32px] p-8 h-full flex flex-col relative overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 transition-all duration-200">


            {/* Header: Date Strip */}
            <div className="mb-6">
                <div className="flex justify-between items-end mb-5">
                    <h3 className="text-2xl font-semibold tracking-tight">Schedule</h3>
                    <div className="flex gap-4 text-sm font-medium text-gray-500">
                        <span className="text-gray-900 dark:text-white font-semibold">Days</span>
                    </div>
                </div>

                {/* Date Scroll Area */}
                <div className="flex gap-3 overflow-x-auto py-6 px-2 -mx-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {days.map((day) => {
                        const isSelected = selectedDate === day.isoDate;
                        return (
                            <button
                                key={day.isoDate}
                                onClick={() => setSelectedDate(day.isoDate)}
                                className={`flex flex-col items-center justify-center min-w-[60px] h-[90px] rounded-[30px] transition-all duration-300 ${isSelected
                                    ? 'bg-[#E0C8FF] text-black scale-110 z-10'
                                    : 'bg-gray-100 dark:bg-[#1C1C1E] text-gray-500 hover:bg-gray-200 dark:hover:bg-[#2C2C2E] hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className={`text-2xl font-bold mb-1 leading-none ${isSelected ? 'text-black' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {String(day.dayNum).padStart(2, '0')}
                                </span>
                                <span className={`text-[12px] font-medium tracking-wide ${isSelected ? 'text-gray-900' : 'text-gray-500 dark:text-gray-600'}`}>
                                    {day.dayName}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tasks List - Grid Layout for Main Widget */}
            <div className="flex-1 overflow-hidden flex flex-col mt-4">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold opacity-70 tracking-wide">Tasks ({currentTasks.length})</span>
                    {/* Progress pill */}
                    {currentTasks.length > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(74,222,128,0.4)]"
                                    style={{ width: `${(completedCount / currentTasks.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm font-mono opacity-60 text-gray-400 dark:text-gray-300">{Math.round((completedCount / currentTasks.length) * 100)}%</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode='popLayout'>
                            {currentTasks.length > 0 ? (
                                currentTasks.map((task, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={task.id || i}
                                        className="group p-5 rounded-2xl bg-white/60 dark:bg-[#1C1C1E]/60 hover:bg-white/80 dark:hover:bg-[#2C2C2E]/80 backdrop-blur-md border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col gap-3"
                                    >
                                        <div className="flex justify-between items-start">
                                            {/* Icon */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner ${task.status === 'completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                                                task.status === 'in_progress' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                                                    'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {task.icon || '📝'}
                                            </div>

                                            {/* Status Dot */}
                                            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${task.status === 'completed' ? 'bg-green-500 text-green-500' :
                                                task.status === 'in_progress' ? 'bg-orange-500 text-orange-500' :
                                                    'bg-gray-400 dark:bg-gray-600 text-gray-400 dark:text-gray-600'
                                                }`} />
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0">
                                            <h4 className={`text-base font-bold truncate text-gray-900 dark:text-white mb-1 ${task.status === 'completed' ? 'opacity-50 line-through' : ''}`}>
                                                {task.title}
                                            </h4>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {/* Roadmap Badge */}
                                                {task.roadmap_title && (
                                                    <span className="text-[10px] px-2 py-1 rounded-md font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 truncate max-w-full">
                                                        {task.roadmap_title}
                                                    </span>
                                                )}
                                                {/* Time Badge */}
                                                <span className={`text-[10px] px-2 py-1 rounded-md font-medium border ${task.status === 'completed' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-300 border-green-200 dark:border-green-500/20' :
                                                    task.status === 'in_progress' ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-500/20' :
                                                        'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10'
                                                    }`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full flex flex-col items-center justify-center h-60 text-center opacity-40"
                                >
                                    <span className="text-5xl mb-4 grayscale opacity-50">☕</span>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">No tasks scheduled</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Time to relax or plan ahead!</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default TaskSchedulerWidget;
