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
                        className="relative z-[101] w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-borderMuted/50 bg-gradient-to-br from-white via-white/95 to-beigePrimary/40 backdrop-blur-xl shadow-2xl dark:border-white/5 dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:via-[#121212] dark:to-[#0f0f0f]"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-borderMuted/50 bg-gradient-to-b from-white/80 to-beigePrimary/20 px-6 py-6 dark:border-white/5 dark:from-[#1a1a1a]/80 dark:to-[#0f0f0f]/80">
                            <div className="flex-1 pr-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="rounded-full bg-terracotta/10 px-3 py-1 text-xs font-bold text-terracotta dark:bg-terracotta/20 dark:text-terracotta/80">
                                        {task?.task_type === 'exam' ? 'Exam Task' : 'Learning Task'}
                                    </span>
                                    {task?.estimated_minutes && (
                                        <span className="flex items-center gap-1 text-xs text-textSecondary dark:text-slate-400">
                                            <Clock className="h-3 w-3" />
                                            {task.estimated_minutes} min
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-textPrimary dark:text-white">
                                    {task?.title}
                                </h2>
                                {task?.description && (
                                    <p className="mt-2 text-sm text-textSecondary dark:text-slate-400">
                                        {task.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-beigeMuted/60 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="h-5 w-5 text-textSecondary dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                            {loading ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-terracotta dark:text-terracotta" />
                                    <p className="mt-4 text-sm text-textSecondary dark:text-slate-400">Loading guide...</p>
                                </div>
                            ) : guidance ? (
                                <div className="space-y-6">
                                    {/* Objective */}
                                    <div className="rounded-2xl border border-terracotta/30 bg-gradient-to-br from-terracotta/8 to-transparent p-5 dark:border-terracotta/20 dark:from-terracotta/5">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-terracotta dark:text-terracotta/80" />
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-terracotta dark:text-terracotta/80">
                                                Objective
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed text-textPrimary dark:text-slate-300">
                                            {guidance.objective}
                                        </p>
                                    </div>

                                    {/* Time Breakdown */}
                                    {guidance.time_breakdown && guidance.time_breakdown.length > 0 && (
                                        <div>
                                            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-terracotta dark:text-terracotta/80">
                                                <Clock className="h-4 w-4" />
                                                Time Breakdown
                                            </h3>
                                            <div className="space-y-2">
                                                {guidance.time_breakdown.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 rounded-xl border border-borderMuted/50 bg-white/60 p-3 dark:border-white/5 dark:bg-white/5"
                                                    >
                                                        <span className="flex h-8 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-terracotta/10 text-xs font-bold text-terracotta dark:bg-terracotta/20 dark:text-terracotta/80">
                                                            {item.duration}
                                                        </span>
                                                        <span className="text-sm text-textPrimary dark:text-slate-300">
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
                                            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-terracotta dark:text-terracotta/80">
                                                📝 Step-by-Step Guide
                                            </h3>
                                            <div className="space-y-3">
                                                {guidance.steps.map((step) => (
                                                    <div
                                                        key={step.step}
                                                        className="flex gap-4 rounded-xl border border-borderMuted/50 bg-white/60 p-4 dark:border-white/5 dark:bg-white/5"
                                                    >
                                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-terracotta to-terracottaHover text-sm font-bold text-white dark:from-terracotta dark:to-terracotta/80">
                                                            {step.step}
                                                        </div>
                                                        <div>
                                                            <h4 className="mb-1 font-semibold text-textPrimary dark:text-white">
                                                                {step.title}
                                                            </h4>
                                                            <p className="text-sm text-textSecondary dark:text-slate-400">
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
                                            <div className="rounded-2xl border border-terracotta/30 bg-gradient-to-br from-terracotta/8 to-transparent p-4 dark:border-terracotta/20 dark:from-terracotta/5">
                                                <h3 className="mb-2 flex items-center gap-2 font-semibold text-terracotta dark:text-terracotta/80">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Best Practices
                                                </h3>
                                                <ul className="space-y-1">
                                                    {guidance.best_practices.map((practice, idx) => (
                                                        <li key={idx} className="text-sm text-terracotta dark:text-terracotta/80">
                                                            • {practice}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Common Mistakes */}
                                        {guidance.common_mistakes && guidance.common_mistakes.length > 0 && (
                                            <div className="rounded-2xl border border-sage/30 bg-gradient-to-br from-sage/8 to-transparent p-4 dark:border-sage/20 dark:from-sage/5">
                                                <h3 className="mb-2 flex items-center gap-2 font-semibold text-sage dark:text-sage/80">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Avoid These
                                                </h3>
                                                <ul className="space-y-1">
                                                    {guidance.common_mistakes.map((mistake, idx) => (
                                                        <li key={idx} className="text-sm text-sage dark:text-sage/80">
                                                            • {mistake}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Tips */}
                                    {guidance.quick_tips && guidance.quick_tips.length > 0 && (
                                        <div className="rounded-2xl border border-terracotta/30 bg-gradient-to-br from-terracotta/8 to-transparent p-4 dark:border-terracotta/20 dark:from-terracotta/5">
                                            <h3 className="mb-2 flex items-center gap-2 font-semibold text-terracotta dark:text-terracotta/80">
                                                <Lightbulb className="h-4 w-4" />
                                                Quick Tips
                                            </h3>
                                            <ul className="space-y-1">
                                                {guidance.quick_tips.map((tip, idx) => (
                                                    <li key={idx} className="text-sm text-terracotta dark:text-terracotta/80">
                                                        • {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Related Resources */}
                                    {task?.related_links && task.related_links.length > 0 && (
                                        <div>
                                            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-terracotta dark:text-terracotta/80">
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
                                                        className="flex items-center gap-2 rounded-xl border border-terracotta/30 bg-gradient-to-br from-terracotta/8 to-transparent p-3 text-sm text-terracotta hover:from-terracotta/15 dark:border-terracotta/20 dark:from-terracotta/5 dark:text-terracotta/80 dark:hover:from-terracotta/10"
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
                                <div className="py-12 text-center text-textSecondary dark:text-slate-400">
                                    No guidance available
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 flex items-center justify-between border-t border-borderMuted/50 bg-gradient-to-t from-white/80 to-transparent px-6 py-5 dark:border-white/5 dark:from-[#0f0f0f]/80 dark:to-transparent">
                            <button
                                onClick={onClose}
                                className="rounded-xl border border-borderMuted/60 bg-white/40 px-5 py-2.5 text-sm font-semibold text-textPrimary backdrop-blur-sm transition-all hover:bg-white/70 hover:border-terracotta/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:border-terracotta/30"
                            >
                                Close
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStartFocusFromModal}
                                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-terracotta to-terracottaHover px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-terracotta/40 transition-all hover:shadow-terracotta/60 dark:from-terracotta dark:to-terracottaHover dark:shadow-terracotta/30 dark:hover:shadow-terracotta/50"
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
