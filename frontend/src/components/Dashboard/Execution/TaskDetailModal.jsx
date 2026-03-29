import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Clock, Target, Lightbulb, AlertCircle, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { executionService } from '../../../api/executionService';

const TaskDetailModal = ({ task, isOpen, onClose, onStartFocus }) => {
    const [guidance, setGuidance] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchGuidance = useCallback(async () => {
        if (!task?.id) return;

        setLoading(true);
        try {
            const data = await executionService.getTaskGuidance(task.id);
            setGuidance(data);
        } catch (error) {
            console.error('Failed to fetch guidance:', error);
            // Set fallback guidance
            setGuidance({
                objective: task.description || task.title,
                time_breakdown: [
                    { duration: '5 min', activity: 'Review task requirements' },
                    { duration: `${task.estimated_minutes || 20} min`, activity: 'Execute focused work' },
                    { duration: '5 min', activity: 'Review and document' }
                ],
                steps: [
                    { step: 1, title: 'Understand the objective', description: 'Review what needs to be accomplished' },
                    { step: 2, title: 'Gather resources', description: 'Prepare necessary materials and tools' },
                    { step: 3, title: 'Execute', description: 'Complete the main work' },
                    { step: 4, title: 'Validate', description: 'Review your work before marking complete' }
                ],
                best_practices: ['Focus on one task at a time', 'Take short breaks if needed'],
                common_mistakes: ['Starting without clear objectives', 'Multitasking'],
                quick_tips: ['Set a timer', 'Eliminate distractions', 'Have water nearby']
            });
        } finally {
            setLoading(false);
        }
    }, [task]);

    useEffect(() => {
        if (isOpen && task?.id) {
            fetchGuidance();
        }
    }, [isOpen, task?.id, fetchGuidance]);

    const handleStartFocusFromModal = () => {
        onStartFocus(task);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-[101] w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#121212]"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-white/10 dark:bg-[#121212]">
                            <div className="flex-1 pr-4">
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                        {task?.task_type === 'exam' ? 'Exam Task' : 'Learning Task'}
                                    </span>
                                    {task?.estimated_minutes && (
                                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                            <Clock className="h-3 w-3" />
                                            {task.estimated_minutes} min
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {task?.title}
                                </h2>
                                {task?.description && (
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                        {task.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
                            >
                                <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                            {loading ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading guide...</p>
                                </div>
                            ) : guidance ? (
                                <div className="space-y-6">
                                    {/* Objective */}
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                                                Objective
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                            {guidance.objective}
                                        </p>
                                    </div>

                                    {/* Time Breakdown */}
                                    {guidance.time_breakdown && guidance.time_breakdown.length > 0 && (
                                        <div>
                                            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                                                <Clock className="h-4 w-4" />
                                                Time Breakdown
                                            </h3>
                                            <div className="space-y-2">
                                                {guidance.time_breakdown.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#1a1a1a]"
                                                    >
                                                        <span className="flex h-8 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                                            {item.duration}
                                                        </span>
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                                            {item.activity}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step-by-Step Guide */}
                                    {guidance.steps && guidance.steps.length > 0 && (
                                        <div>
                                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                                                📝 Step-by-Step Guide
                                            </h3>
                                            <div className="space-y-3">
                                                {guidance.steps.map((step) => (
                                                    <div
                                                        key={step.step}
                                                        className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a1a1a]"
                                                    >
                                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                                            {step.step}
                                                        </div>
                                                        <div>
                                                            <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">
                                                                {step.title}
                                                            </h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                {step.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Best Practices */}
                                        {guidance.best_practices && guidance.best_practices.length > 0 && (
                                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                                <h3 className="mb-2 flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-300">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Best Practices
                                                </h3>
                                                <ul className="space-y-1">
                                                    {guidance.best_practices.map((practice, idx) => (
                                                        <li key={idx} className="text-sm text-emerald-800 dark:text-emerald-200">
                                                            • {practice}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Common Mistakes */}
                                        {guidance.common_mistakes && guidance.common_mistakes.length > 0 && (
                                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                                                <h3 className="mb-2 flex items-center gap-2 font-semibold text-red-900 dark:text-red-300">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Avoid These
                                                </h3>
                                                <ul className="space-y-1">
                                                    {guidance.common_mistakes.map((mistake, idx) => (
                                                        <li key={idx} className="text-sm text-red-800 dark:text-red-200">
                                                            • {mistake}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Tips */}
                                    {guidance.quick_tips && guidance.quick_tips.length > 0 && (
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                                            <h3 className="mb-2 flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-300">
                                                <Lightbulb className="h-4 w-4" />
                                                Quick Tips
                                            </h3>
                                            <ul className="space-y-1">
                                                {guidance.quick_tips.map((tip, idx) => (
                                                    <li key={idx} className="text-sm text-amber-800 dark:text-amber-200">
                                                        • {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Related Resources */}
                                    {task?.related_links && task.related_links.length > 0 && (
                                        <div>
                                            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                                                <ExternalLink className="h-4 w-4" />
                                                Related Resources
                                            </h3>
                                            <div className="space-y-2">
                                                {task.related_links.map((link, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-blue-600 hover:bg-slate-50 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-blue-400 dark:hover:bg-white/5"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        {link.title || link.url}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                                    No guidance available
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4 dark:border-white/10 dark:bg-[#121212]">
                            <button
                                onClick={onClose}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                            >
                                Close
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleStartFocusFromModal}
                                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 dark:bg-white dark:text-black dark:shadow-white/10 dark:hover:bg-slate-200"
                            >
                                <Play className="h-4 w-4 fill-current" />
                                <span>Start Focus Session</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TaskDetailModal;
