import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { schedulerService } from '../../../api/schedulerService';
import { FaTimes, FaClock, FaCheckCircle, FaLightbulb, FaExclamationTriangle, FaFlag, FaSpinner } from 'react-icons/fa';

const TaskSchedulerWidget = ({ tasks = [] }) => {
    // Generate dates
    const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            date: d,
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: d.getDate(),
            isoDate: d.toLocaleDateString('en-CA')
        };
    });

    const [selectedDate, setSelectedDate] = useState(days[0].isoDate);
    const [selectedTask, setSelectedTask] = useState(null);
    const [guidance, setGuidance] = useState(null);
    const [loadingGuidance, setLoadingGuidance] = useState(false);

    const currentTasks = tasks.filter(task => task.due_date === selectedDate);
    const completedCount = currentTasks.filter(t => t.status === 'completed').length;

    const handleTaskClick = async (task) => {
        setSelectedTask(task);
        setGuidance(null);
        setLoadingGuidance(true);

        try {
            const guidanceData = await schedulerService.getTaskGuidance(task.id);
            setGuidance(guidanceData);
        } catch (error) {
            console.error('Failed to load guidance:', error);
            setGuidance({
                generated: false,
                objective: `Complete the task: ${task.title}`,
                time_breakdown: [
                    { duration: '10 min', activity: 'Review and understand the task' },
                    { duration: '40 min', activity: 'Work on the main activity' },
                    { duration: '10 min', activity: 'Review your work' }
                ],
                steps: [
                    { step: 1, title: 'Understand the Task', description: task.description || 'Read through the task carefully.' },
                    { step: 2, title: 'Gather Resources', description: 'Find any materials or tools you need.' },
                    { step: 3, title: 'Start Working', description: 'Begin the main activity.' },
                    { step: 4, title: 'Review & Document', description: 'Check what you accomplished and take notes.' }
                ],
                best_practices: ['Focus on understanding over rushing', 'Take short breaks if needed'],
                common_mistakes: ['Skipping the planning phase', 'Not taking notes'],
                expected_outcome: `By completing this task, you'll make meaningful progress on your learning goals.`
            });
        } finally {
            setLoadingGuidance(false);
        }
    };

    const closeModal = () => {
        setSelectedTask(null);
        setGuidance(null);
    };

    return (
        <div className="bg-white dark:bg-black text-gray-900 dark:text-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-xl sm:shadow-2xl border border-gray-100 dark:border-white/5 transition-all duration-200">

            {/* Header: Date Strip */}
            <div className="mb-4 sm:mb-6">
                <div className="flex justify-between items-end mb-4 sm:mb-5">
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">Schedule</h3>
                    <div className="flex gap-4 text-sm font-medium text-gray-500">
                        <span className="text-gray-900 dark:text-white font-semibold">Days</span>
                    </div>
                </div>

                {/* Date Scroll Area */}
                <div className="flex gap-2 sm:gap-3 overflow-x-auto py-4 sm:py-6 px-1 sm:px-2 -mx-1 sm:-mx-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {days.map((day) => {
                        const isSelected = selectedDate === day.isoDate;
                        return (
                            <button
                                key={day.isoDate}
                                onClick={() => setSelectedDate(day.isoDate)}
                                className={`flex flex-col items-center justify-center min-w-[48px] sm:min-w-[60px] h-[72px] sm:h-[90px] rounded-[20px] sm:rounded-[30px] transition-all duration-300 flex-shrink-0 ${isSelected
                                    ? 'bg-[#E0C8FF] text-black scale-105 sm:scale-110 z-10'
                                    : 'bg-gray-100 dark:bg-[#1C1C1E] text-gray-500 hover:bg-gray-200 dark:hover:bg-[#2C2C2E] hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className={`text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 leading-none ${isSelected ? 'text-black' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {String(day.dayNum).padStart(2, '0')}
                                </span>
                                <span className={`text-[10px] sm:text-[12px] font-medium tracking-wide ${isSelected ? 'text-gray-900' : 'text-gray-500 dark:text-gray-600'}`}>
                                    {day.dayName}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>


            {/* Tasks List */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold opacity-70 tracking-wide">Tasks ({currentTasks.length})</span>
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

                <div className="space-y-3">
                    <AnimatePresence mode='popLayout'>
                        {currentTasks.length > 0 ? (
                            currentTasks.map((task, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={task.id || i}
                                    onClick={() => handleTaskClick(task)}
                                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-[#1C1C1E]/60 hover:bg-white/80 dark:hover:bg-[#2C2C2E]/80 backdrop-blur-md border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all hover:shadow-lg cursor-pointer"
                                >
                                    {/* Task Number/Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${task.status === 'completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                                        task.status === 'in_progress' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                                            'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'
                                        }`}>
                                        {task.status === 'completed' ? '✓' : i + 1}
                                    </div>

                                    {/* Task Content */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-base font-semibold text-gray-900 dark:text-white truncate ${task.status === 'completed' ? 'opacity-50 line-through' : ''}`}>
                                            {task.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {task.roadmap_title && (
                                                <>
                                                    <span className="truncate max-w-[150px]">📚 {task.roadmap_title}</span>
                                                    <span>•</span>
                                                </>
                                            )}
                                            <span>⏱️ {task.estimated_minutes || 60} min</span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${task.status === 'completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                                            task.status === 'in_progress' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                                                'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {task.status?.replace('_', ' ')}
                                        </span>

                                        {/* Arrow indicator */}
                                        <span className="text-gray-300 dark:text-gray-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                                            →
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-8 text-center opacity-40"
                            >
                                <span className="text-4xl mb-3 grayscale opacity-50">☕</span>
                                <p className="text-base font-medium text-gray-900 dark:text-white">No tasks scheduled</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Time to relax or plan ahead!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Task Guidance Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">{selectedTask.icon || '📝'}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${selectedTask.status === 'completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                                                selectedTask.status === 'in_progress' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                                                    'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {selectedTask.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{selectedTask.title}</h2>
                                        {selectedTask.roadmap_title && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">📚 {selectedTask.roadmap_title}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <FaTimes className="text-gray-400" />
                                    </button>
                                </div>

                                {/* Time & Day Info */}
                                <div className="flex gap-4 mt-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <FaClock className="text-purple-500" />
                                        <span>{selectedTask.estimated_minutes || 60} min</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <FaFlag className="text-blue-500" />
                                        <span>Day {selectedTask.day}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {loadingGuidance ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <FaSpinner className="text-4xl text-purple-500 animate-spin mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">Generating your personalized guide...</p>
                                    </div>
                                ) : guidance ? (
                                    <div className="space-y-6">
                                        {/* Objective */}
                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-500/20">
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                🎯 Objective
                                            </h3>
                                            <p className="text-gray-700 dark:text-gray-300">{guidance.objective}</p>
                                        </div>

                                        {/* Time Breakdown */}
                                        {guidance.time_breakdown && (
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <FaClock className="text-purple-500" /> Time Breakdown
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {guidance.time_breakdown.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-sm">
                                                            <span className="font-bold text-purple-600 dark:text-purple-400">{item.duration}</span>
                                                            <span className="text-gray-600 dark:text-gray-400">{item.activity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step-by-Step Guide */}
                                        {guidance.steps && (
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    📝 Step-by-Step Guide
                                                </h3>
                                                <div className="space-y-3">
                                                    {guidance.steps.map((step, i) => (
                                                        <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                                {step.step || i + 1}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 dark:text-white">{step.title}</h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Best Practices */}
                                        {guidance.best_practices && (
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <FaCheckCircle className="text-green-500" /> Best Practices
                                                </h3>
                                                <ul className="space-y-2">
                                                    {guidance.best_practices.map((tip, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="text-green-500 mt-0.5">✓</span>
                                                            {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Common Mistakes */}
                                        {guidance.common_mistakes && (
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <FaExclamationTriangle className="text-orange-500" /> Common Mistakes to Avoid
                                                </h3>
                                                <ul className="space-y-2">
                                                    {guidance.common_mistakes.map((mistake, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="text-orange-500 mt-0.5">⚠</span>
                                                            {mistake}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Expected Outcome */}
                                        {guidance.expected_outcome && (
                                            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                    🏁 Expected Outcome
                                                </h3>
                                                <p className="text-gray-700 dark:text-gray-300">{guidance.expected_outcome}</p>
                                            </div>
                                        )}

                                        {/* Quick Tips */}
                                        {guidance.quick_tips && guidance.quick_tips.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <FaLightbulb className="text-yellow-500" /> Quick Tips
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {guidance.quick_tips.map((tip, i) => (
                                                        <span key={i} className="px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/20">
                                                            💡 {tip}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
