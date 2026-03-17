import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { schedulerService } from '../../../api/schedulerService';
import { FaTimes, FaClock, FaCheckCircle, FaLightbulb, FaExclamationTriangle, FaFlag, FaSpinner } from 'react-icons/fa';

const SHELL_CLASS = 'rounded-[20px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90';
const SECTION_CARD = 'rounded-2xl border border-slate-200/75 bg-white/80 p-3 dark:border-slate-700/80 dark:bg-slate-900/75';

const TaskSchedulerWidget = ({ tasks = [] }) => {
    const days = useMemo(() => {
        return Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return {
                date: d,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: d.getDate(),
                isoDate: d.toLocaleDateString('en-CA')
            };
        });
    }, []);

    const [selectedDate, setSelectedDate] = useState(days[0].isoDate);
    const [selectedTask, setSelectedTask] = useState(null);
    const [guidance, setGuidance] = useState(null);
    const [loadingGuidance, setLoadingGuidance] = useState(false);

    const currentTasks = tasks.filter((task) => task.due_date === selectedDate);
    const completedCount = currentTasks.filter((task) => task.status === 'completed').length;
    const completionPct = currentTasks.length > 0 ? Math.round((completedCount / currentTasks.length) * 100) : 0;

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
                    { duration: '10 min', activity: 'Review and frame the goal' },
                    { duration: '40 min', activity: 'Execute the core work' },
                    { duration: '10 min', activity: 'Review and summarize outcomes' }
                ],
                steps: [
                    { step: 1, title: 'Clarify success', description: task.description || 'Define exactly what done looks like.' },
                    { step: 2, title: 'Prepare resources', description: 'Gather references, tools, and blockers upfront.' },
                    { step: 3, title: 'Execute deeply', description: 'Run uninterrupted focus blocks.' },
                    { step: 4, title: 'Close loop', description: 'Document progress and next step.' }
                ],
                best_practices: ['Use time-boxed focus blocks', 'End with one measurable output'],
                common_mistakes: ['Starting without success criteria', 'Switching context too often'],
                expected_outcome: 'You move one meaningful step forward with clear evidence of progress.'
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
        <div className={`${SHELL_CLASS} h-full overflow-hidden`}>
            <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">Schedule</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">One place for daily execution tasks</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                    {currentTasks.length} tasks
                </span>
            </div>

            <div className="mb-4 overflow-x-auto pb-1 no-scrollbar">
                <div className="flex min-w-max gap-2">
                    {days.map((day) => {
                        const isSelected = selectedDate === day.isoDate;
                        return (
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                key={day.isoDate}
                                onClick={() => setSelectedDate(day.isoDate)}
                                className={`flex h-14 w-12 flex-col items-center justify-center rounded-xl border text-xs transition-all ${isSelected
                                    ? 'border-blue-300 bg-gradient-to-b from-blue-600 to-blue-500 text-white shadow-[0_10px_18px_-12px_rgba(37,99,235,0.9)]'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-300'
                                    }`}
                            >
                                <span className="text-base font-semibold leading-none">{String(day.dayNum).padStart(2, '0')}</span>
                                <span className="mt-1 text-[10px] uppercase tracking-[0.08em]">{day.dayName}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <div className={`${SECTION_CARD} mb-4`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Day progress</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{completionPct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500"
                    />
                </div>
            </div>

            <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                    {currentTasks.length > 0 ? (
                        currentTasks.map((task, i) => {
                            const taskTone = task.status === 'completed'
                                ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/12 dark:text-blue-300'
                                : task.status === 'in_progress'
                                    ? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/12 dark:text-orange-300'
                                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300';

                            return (
                                <motion.button
                                    type="button"
                                    key={task.id || i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.22, delay: i * 0.03 }}
                                    onClick={() => handleTaskClick(task)}
                                    className="group flex w-full items-center gap-3 rounded-xl border border-slate-200/80 bg-white/85 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_10px_18px_-14px_rgba(37,99,235,0.55)] dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-blue-500/40"
                                >
                                    <div className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${taskTone}`}>
                                        {task.status === 'completed' ? '✓' : i + 1}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className={`truncate text-sm font-semibold ${task.status === 'completed' ? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                            {task.title}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            {task.roadmap_title && <span className="truncate">{task.roadmap_title}</span>}
                                            <span>•</span>
                                            <span>{task.estimated_minutes || 60} min</span>
                                        </div>
                                    </div>

                                    <div className="inline-flex items-center gap-2">
                                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${taskTone}`}>
                                            {task.status?.replace('_', ' ') || 'pending'}
                                        </span>
                                        <span className="text-slate-300 transition-colors group-hover:text-blue-500 dark:text-slate-600 dark:group-hover:text-blue-300">→</span>
                                    </div>
                                </motion.button>
                            );
                        })
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400"
                        >
                            No tasks scheduled for this day.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 16, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.96 }}
                            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                            className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="border-b border-slate-200 bg-gradient-to-r from-blue-600/10 to-blue-500/5 p-5 dark:border-slate-700">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="text-2xl">{selectedTask.icon || '📝'}</span>
                                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                {selectedTask.status?.replace('_', ' ') || 'pending'}
                                            </span>
                                        </div>
                                        <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-white">{selectedTask.title}</h2>
                                        {selectedTask.roadmap_title && (
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{selectedTask.roadmap_title}</p>
                                        )}
                                    </div>

                                    <motion.button whileTap={{ scale: 0.94 }} onClick={closeModal} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white">
                                        <FaTimes size={12} />
                                    </motion.button>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="inline-flex items-center gap-1.5"><FaClock className="text-blue-500" /> {selectedTask.estimated_minutes || 60} min</div>
                                    <div className="inline-flex items-center gap-1.5"><FaFlag className="text-orange-500" /> Day {selectedTask.day}</div>
                                </div>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-5">
                                {loadingGuidance ? (
                                    <div className="py-10 text-center">
                                        <FaSpinner className="mx-auto mb-3 animate-spin text-3xl text-blue-500" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Generating task guidance...</p>
                                    </div>
                                ) : guidance ? (
                                    <div className="space-y-5">
                                        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                                            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Objective</h3>
                                            <p className="text-sm text-slate-700 dark:text-slate-200">{guidance.objective}</p>
                                        </div>

                                        {guidance.time_breakdown && (
                                            <div>
                                                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Time Breakdown</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {guidance.time_breakdown.map((item, index) => (
                                                        <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800/70">
                                                            <span className="font-semibold text-blue-700 dark:text-blue-300">{item.duration}</span>
                                                            <span className="ml-1 text-slate-600 dark:text-slate-300">{item.activity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {guidance.steps && (
                                            <div>
                                                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Step-by-Step</h3>
                                                <div className="space-y-2">
                                                    {guidance.steps.map((step, index) => (
                                                        <div key={index} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/70">
                                                            <div className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                                                {step.step || index + 1}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.title}</p>
                                                                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{step.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {guidance.best_practices && (
                                            <div>
                                                <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                    <FaCheckCircle className="text-blue-500" /> Best Practices
                                                </h3>
                                                <ul className="space-y-1.5">
                                                    {guidance.best_practices.map((tip, index) => (
                                                        <li key={index} className="text-sm text-slate-700 dark:text-slate-200">• {tip}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {guidance.common_mistakes && (
                                            <div>
                                                <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                    <FaExclamationTriangle className="text-orange-500" /> Mistakes to Avoid
                                                </h3>
                                                <ul className="space-y-1.5">
                                                    {guidance.common_mistakes.map((mistake, index) => (
                                                        <li key={index} className="text-sm text-slate-700 dark:text-slate-200">• {mistake}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {guidance.expected_outcome && (
                                            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4 dark:border-orange-500/30 dark:bg-orange-500/10">
                                                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Expected Outcome</h3>
                                                <p className="text-sm text-slate-700 dark:text-slate-200">{guidance.expected_outcome}</p>
                                            </div>
                                        )}

                                        {guidance.quick_tips && guidance.quick_tips.length > 0 && (
                                            <div>
                                                <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                    <FaLightbulb className="text-orange-500" /> Quick Tips
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {guidance.quick_tips.map((tip, index) => (
                                                        <span key={index} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">
                                                            {tip}
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
        </div>
    );
};

export default TaskSchedulerWidget;
