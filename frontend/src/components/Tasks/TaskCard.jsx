import React from 'react';
import { motion } from 'framer-motion';

export default function TaskCard({ task, onUpdate, onComplete, onDelete }) {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
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
                        <div>
                            <h3 className={`font-medium text-gray-900 dark:text-white ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                                {task.title}
                            </h3>
                            {task.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
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
                    <div className="flex gap-2 mt-4">
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
    );
}
