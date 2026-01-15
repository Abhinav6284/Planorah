import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { tasksService } from '../../api/tasksService';
import { FaTimes, FaLightbulb, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function TaskCard({ task, onUpdate, onComplete, onDelete, isHighlighted }) {
    const [showGuidance, setShowGuidance] = useState(false);
    const [guidance, setGuidance] = useState(null);
    const [loadingGuidance, setLoadingGuidance] = useState(false);

    const statusColors = {
        'not_started': 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
        'in_progress': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        'completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        'needs_revision': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus === 'completed') {
            onComplete(task.id);
        } else {
            onUpdate(task.id, { status: newStatus });
        }
    };

    const handleGetGuidance = async () => {
        setShowGuidance(true);
        if (!guidance) {
            setLoadingGuidance(true);
            try {
                const response = await tasksService.getTaskGuidance(task.id);
                setGuidance(response.data);
            } catch (error) {
                console.error('Failed to fetch guidance:', error);
                setGuidance({
                    error: true,
                    objective: 'Unable to generate guidance at this time.',
                    steps: [{ step: 1, title: 'Try Again', description: 'Please try again later.' }]
                });
            } finally {
                setLoadingGuidance(false);
            }
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow ${isHighlighted ? 'ring-2 ring-indigo-500' : ''}`}
            >
                <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                        onClick={() => handleStatusChange(task.status === 'completed' ? 'not_started' : 'completed')}
                        className="mt-1 flex-shrink-0"
                    >
                        {task.status === 'completed' ? (
                            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:border-green-500 transition-colors" />
                        )}
                    </button>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 cursor-pointer" onClick={handleGetGuidance}>
                                <h3 className={`font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                                    {task.title}
                                </h3>
                                {task.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                                    <span>📅 Day {task.day}</span>
                                    <span>⏱️ {task.estimated_minutes} min</span>
                                    {task.is_revision && <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">Revision</span>}
                                </div>
                            </div>

                            {/* Status Dropdown */}
                            <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium ${statusColors[task.status]} border-none cursor-pointer`}
                            >
                                <option value="not_started">Not Started</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="needs_revision">Needs Revision</option>
                            </select>
                        </div>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex gap-2 mt-3">
                                {task.tags.map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleGetGuidance}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                <FaLightbulb className="text-xs" /> Get Guidance
                            </button>
                            <button
                                onClick={() => onDelete(task.id)}
                                className="text-sm text-red-600 dark:text-red-400 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Guidance Modal - Portaled to body */}
            {typeof document !== 'undefined' && ReactDOM.createPortal(
                <AnimatePresence>
                    {showGuidance && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                            onClick={() => setShowGuidance(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto relative z-[101]"
                            >
                                {/* Header */}
                                <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Guidance</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.title}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowGuidance(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                    >
                                        <FaTimes className="text-gray-500" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {loadingGuidance ? (
                                        <div className="py-12 text-center">
                                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Generating your personalized guidance...</p>
                                        </div>
                                    ) : guidance ? (
                                        <div className="space-y-6">
                                            {/* Objective */}
                                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4">
                                                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-2">
                                                    🎯 Objective
                                                </h3>
                                                <p className="text-gray-700 dark:text-gray-300">{guidance.objective}</p>
                                            </div>

                                            {/* Time Breakdown */}
                                            {guidance.time_breakdown && guidance.time_breakdown.length > 0 && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                                        <FaClock className="text-blue-500" /> Time Breakdown
                                                    </h3>
                                                    <div className="grid gap-2">
                                                        {guidance.time_breakdown.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium whitespace-nowrap">
                                                                    {item.duration}
                                                                </span>
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">{item.activity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Steps */}
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📝 Step-by-Step Guide</h3>
                                                <div className="space-y-3">
                                                    {guidance.steps && guidance.steps.map((step, idx) => (
                                                        <div key={idx} className="flex gap-3">
                                                            <div className="flex-shrink-0 w-7 h-7 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold">
                                                                {step.step || idx + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900 dark:text-white">{step.title}</h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Best Practices */}
                                            {guidance.best_practices && guidance.best_practices.length > 0 && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                                        <FaCheckCircle className="text-green-500" /> Best Practices
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {guidance.best_practices.map((tip, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                                <span className="text-green-500 mt-0.5">✓</span>
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Common Mistakes */}
                                            {guidance.common_mistakes && guidance.common_mistakes.length > 0 && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                                        <FaExclamationTriangle className="text-yellow-500" /> Common Mistakes to Avoid
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {guidance.common_mistakes.map((mistake, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                                <span className="text-yellow-500 mt-0.5">⚠</span>
                                                                {mistake}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Expected Outcome */}
                                            {guidance.expected_outcome && (
                                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                                                    <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">🏁 Expected Outcome</h3>
                                                    <p className="text-gray-700 dark:text-gray-300">{guidance.expected_outcome}</p>
                                                </div>
                                            )}

                                            {/* Quick Tips */}
                                            {guidance.quick_tips && guidance.quick_tips.length > 0 && (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                                                    <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">💡 Quick Tips</h3>
                                                    <ul className="space-y-1">
                                                        {guidance.quick_tips.map((tip, idx) => (
                                                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">• {tip}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                            No guidance available
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between">
                                    <button
                                        onClick={() => {
                                            setShowGuidance(false);
                                            handleStatusChange('in_progress');
                                        }}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        Start Task
                                    </button>
                                    <button
                                        onClick={() => setShowGuidance(false)}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
