import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import AIVoicePanel from '../Mentoring/AIVoicePanel';
import ModeSwitch from './Execution/ModeSwitch';

// New Architecture Components
import TodayExecution from './Execution/TodayExecution';
import FocusMode from './Execution/FocusMode';
import ExecutionFeed from './Execution/ExecutionFeed';
import ProgressPanel from './Execution/ProgressPanel';
import TaskDetailModal from './Execution/TaskDetailModal';

import { useExecutionStore } from '../../store/useExecutionStore';
import { userService } from '../../api/userService';
import { roadmapService } from '../../api/roadmapService';
import { planoraService } from '../../api/planoraService';
import { useMissionFlow } from '../../hooks/useMissionFlow';

const shellCardClass = 'rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-[#121212] dark:shadow-none';

const buildDateKey = (dateValue) => {
    if (!dateValue) {
        return null;
    }
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateLabel = (dateKey) => {
    if (!dateKey) {
        return 'Unscheduled';
    }
    const todayKey = buildDateKey(new Date());
    if (dateKey === todayKey) {
        return 'Today';
    }
    const date = new Date(`${dateKey}T00:00:00`);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

const buildDateRange = (startDate, days) => {
    const range = [];
    for (let i = 0; i < days; i += 1) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        range.push({
            date: day,
            key: buildDateKey(day),
            dayName: day.toLocaleDateString([], { weekday: 'short' }),
            dayNumber: day.getDate(),
        });
    }
    return range;
};

const getTaskStatusLabel = (status) => {
    if (status === 'completed') {
        return 'completed';
    }
    if (status === 'in_progress') {
        return 'in progress';
    }
    return 'not started';
};

const normalizeDisplayTitle = (title) => {
    const text = String(title || '').trim();
    return text.replace(/^[^A-Za-z0-9]+\s*/, '') || text;
};

const ExecutionDashboard = () => {
    const {
        mode,
        setMode,
        todayTask,
        coach,
        tasks,
        examTasks,
        progress,
        loading,
        bootstrap,
        regenerateCoach,
        currentState,
        setExecutionState,
        setTodayTask,
        createFocusSession,
        updateFocusSession,
        updateTaskStatus,
        applyRewards,
        refreshTodayTask
    } = useExecutionStore();

    const [profile, setProfile] = useState(null);
    const [voicePanelOpen, setVoicePanelOpen] = useState(false);
    const [selectedDateKey, setSelectedDateKey] = useState(null);
    const [roadmaps, setRoadmaps] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskModalOpen, setTaskModalOpen] = useState(false);

    useEffect(() => {
        bootstrap();
        userService.getProfile().then(setProfile).catch(() => null);
        roadmapService.getUserRoadmaps().then((data) => setRoadmaps(Array.isArray(data) ? data : [])).catch(() => null);
        planoraService.getSubjects().then((data) => setSubjects(Array.isArray(data) ? data : [])).catch(() => null);
    }, [bootstrap]);

    // Use Mission Flow Hook for logic
    const { handleStartFocus, handleFocusComplete: originalComplete } = useMissionFlow({
        todayTask,
        createFocusSession,
        updateFocusSession,
        updateTaskStatus,
        applyRewards,
        refreshTodayTask
    });

    const onStartFocus = async () => {
      

    const onStartFocusForTask = async (task) => {
        // Update today task to the selected task
        if (task) {
            setTodayTask({
                id: task.id,
                title: task.title,
                description: task.description,
                estimated_minutes: task.estimated_minutes,
                difficulty: task.difficulty,
                reason: task.reason || task.description
            });
        }
        setExecutionState('IN_PROGRESS');
        await handleStartFocus();
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setTaskModalOpen(true);
    };  setExecutionState('IN_PROGRESS');
        await handleStartFocus();
    };

    const onComplete = async (minutes) => {
        await originalComplete(minutes);
        setExecutionState('COMPLETED');
        setTimeout(() => setExecutionState('NOT_STARTED'), 5000);
        // Refresh all data to update stats
        setTimeout(() => bootstrap(), 1000);
    };

    const onCloseFocus = () => {
        setExecutionState('NOT_STARTED');
    };

    const handleChangeTask = useCallback(async () => {
        const next = await regenerateCoach();
        if (next) {
            setTodayTask(prev => ({ ...prev, title: next.task, reason: next.reason, difficulty: next.difficulty, estimated_time: next.estimated_time }));
        }
    }, [regenerateCoach, setTodayTask]);

    const ac    taskData: task, // Store full task data
            tiveTasks = useMemo(() => mode === 'exam' ? examTasks : tasks, [mode, examTasks, tasks]);
    const streak = progress?.stats?.streak || progress?.stats?.current_streak || 0;

    // Replace Exam Subjects with Pending Tasks (Day-wise carry over logic)
    const pendingTaskData = useMemo(() => {
        const pending = (activeTasks || [])
            .filter(t => t.status !== 'completed')
            .sort((a, b) => new Date(a.scheduled_for || a.created_at || 0) - new Date(b.scheduled_for || b.created_at || 0));

        const map = new Map();
        pending.forEach((task) => {
            const dateKey = task?.scheduled_for || buildDateKey(task?.created_at) || buildDateKey(new Date());
            const card = {
                key: task.id,
                tag: 'Pending',
                title: normalizeDisplayTitle(task.title),
                subtitle: task.description || (task?.scheduled_for ? `Scheduled for ${formatDateLabel(dateKey)}` : 'Pending task'),
                ctaTo: '#',
                dateKey,
                status: task.status,
                estimatedMinutes: task.estimated_minutes || 25,
            };
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey).push(card);
        });

        const orderedDates = Array.from(map.keys()).sort();
        return { map, orderedDates };
    }, [activeTasks]);

    useEffect(() => {
        if (selectedDateKey) {
            return;
        }

        if (pendingTaskData.orderedDates.length) {
            setSelectedDateKey(pendingTaskData.orderedDates[0]);
            return;
        }

        setSelectedDateKey(buildDateKey(new Date()));
    }, [pendingTaskData.orderedDates, selectedDateKey]);

    const selectedTasks = useMemo(() => {
        const tasksForDate = pendingTaskData.map.get(selectedDateKey) || [];
        return tasksForDate.slice(0, 5);
    }, [pendingTaskData.map, selectedDateKey]);

    const selectedTaskProgress = useMemo(() => {
        if (!selectedTasks.length) {
            return 0;
        }
        const completed = selectedTasks.filter((task) => task.status === 'completed').length;
        return Math.round((completed / selectedTasks.length) * 100);
    }, [selectedTasks]);

    const scheduleDays = useMemo(() => {
        const firstTaskDateKey = pendingTaskData.orderedDates[0] || null;
        const baseDate = firstTaskDateKey ? new Date(`${firstTaskDateKey}T00:00:00`) : new Date();
        baseDate.setHours(0, 0, 0, 0);
        return buildDateRange(baseDate, 14).map((day) => ({
            ...day,
            isSelected: day.key === selectedDateKey,
        }));
    }, [pendingTaskData.orderedDates, selectedDateKey]);

    const roadmapCards = useMemo(() => {
        return (roadmaps || []).slice(0, 3).map((roadmap) => ({
            key: roadmap.id,
            title: roadmap.title,
            subtitle: roadmap.overview || 'Open roadmap milestones and linked tasks.',
            ctaTo: `/roadmap/${roadmap.id}`,
        }));
    }, [roadmaps]);

    const subjectCards = useMemo(() => {
        return (subjects || []).slice(0, 4).map((subject) => {
            const progressSummary = subject.progress_summary || {};
            const topicCount = progressSummary.total || ((progressSummary.not_started || 0) + (progressSummary.weak || 0) + (progressSummary.strong || 0));
            return {
                key: subject.id,
                title: subject.name,
                topicCount,
                strong: progressSummary.strong || 0,
                weak: progressSummary.weak || 0,
                notStarted: progressSummary.not_started || 0,
                ctaTo: `/planora/subject/${subject.id}`,
            };
        });
    }, [subjects]);

    return (
        <div className={`min-h-screen text-slate-800 transition-colors duration-500 dark:text-slate-100 ${currentState === 'IN_PROGRESS' ? 'bg-[#050505]' : 'bg-[#F5F5F7] dark:bg-[#0b0b0b]'}`}>

            {/* Focus Mode Overlay */}
            <AnimatePresence>
                {currentState === 'IN_PROGRESS' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-sm"
                    >
                        <FocusMode
                            open={true}
                            task={todayTask}
                            onClose={onCloseFocus}
                            onComplete={onComplete}
                            embedded={true}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`mx-auto max-w-[1480px] p-4 transition-all duration-500 lg:p-6 ${currentState === 'IN_PROGRESS' ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>

                {/* 1. HERO SECTION */}
                <TodayExecution
                    user={profile}
                    todayTask={todayTask}
                    tasks={activeTasks}
                    streak={streak}
                    onStartFocus={onStartFocus}
                    onChangeTask={handleChangeTask}
                    loading={loading.bootstrap}
                />

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">

                    {/* LEFT COLUMN: Main Feed & Activities */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Mode Switcher Block */}
                        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#121212]">
                            <div className="flex items-center gap-4">
                                <ModeSwitch mode={mode} onChange={setMode} />
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {mode === 'learning' ? 'Learning Mode Active' : 'Exam Mode Active'}
                                </span>
                            </div>
                            <button
                                onClick={() => setVoicePanelOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                            >
                                <Sparkles className="h-3.5 w-3.5" /> AI Coach
                            </button>
                        </div>

                        {/* Schedule Section */}
                        <div className={shellCardClass}>
                            <div className="mb-4 flex items-center justify-between pb-2">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Schedule</h3>
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Days</span>
                            </div>

                            {pendingTaskData.orderedDates.length === 0 && (
                                <p className="mb-4 text-sm text-slate-500">No pending tasks. You're all caught up!</p>
                            )}

                            <div className="space-y-5">
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {scheduleDays.map((day) => (
                                        <button
                                            key={day.key}
                                            type="button"
                                            onClick={() => setSelectedDateKey(day.key)}
                                            className={`flex h-[60px] w-[50px] flex-shrink-0 flex-col items-center justify-center gap-[2px] rounded-2xl text-xs font-semibold transition-all ${day.isSelected
                                                ? 'bg-[#e2cfff] text-[#1e1e1e] shadow-sm'
                                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1921] dark:hover:bg-[#25242e]'
                                                }`}
                                        >
                                            <span className={`text-[15px] font-bold leading-none ${day.isSelected ? 'text-[#1e1e1e]' : 'text-slate-700 dark:text-white/80'}`}>{day.dayNumber}</span>
                                            <button
                                                key={card.key}
                                                onClick={() => handleTaskClick(card.taskData)}
                                                className="relative flex w-full items-center gap-4 rounded-[20px] bg-slate-50 p-[14px] text-left transition-all hover:bg-white hover:shadow-md dark:bg-[#1a1921] dark:hover:bg-[#25242e]"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-[13px] font-bold text-violet-800 dark:bg-[#311f4d] dark:text-violet-200">
                                                    {index + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="truncate text-[14px] font-bold text-slate-800 dark:text-slate-100">
                                                        <span className="mr-1.5 inline-flex items-center justify-center rounded bg-[#e8e8e8] p-[3px] dark:bg-[#2a2a2a]">
                                                            <span className="text-[10px]">📚</span>
                                                        </span>
                                                        {card.title}
                                                    </h4>
                                                    <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[9px] dark:bg-[#25242e]">⏱</span>
                                                        {card.estimatedMinutes} min
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold lowercase tracking-wide text-slate-600 dark:border-white/10 dark:text-slate-400">
                                                        {getTaskStatusLabel(card.status)}
                                                    </span>
                                                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                                </div>
                                            </button/div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="truncate text-[14px] font-bold text-slate-800 dark:text-slate-100">
                                                        <span className="mr-1.5 inline-flex items-center justify-center rounded bg-[#e8e8e8] p-[3px] dark:bg-[#2a2a2a]">
                                                            <span className="text-[10px]">📚</span>
                                                        </span>
                                                        {card.title}
                                                    </h4>
                                                    <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[9px] dark:bg-[#25242e]">⏱</span>
                                                        {card.estimatedMinutes} min
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold lowercase tracking-wide text-slate-600 dark:border-white/10 dark:text-slate-400">
                                                        {getTaskStatusLabel(card.status)}
                                                    </span>
                                                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <Link to={card.ctaTo} className="absolute inset-0">
                                                    <span className="sr-only">Open task</span>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mode-specific Linked Section */}
                        {mode === 'learning' ? (
                            <div className={shellCardClass}>
                                <div className="mb-4 flex items-center justify-between pb-2">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Learning Path Roadmaps</h3>
                                    <Link to="/roadmap/list" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200">
                                        View all
                                    </Link>
                                </div>

                                {roadmapCards.length === 0 ? (
                                    <p className="text-sm text-slate-500">No roadmaps found. Create one to link tasks with your learning path.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {roadmapCards.map((roadmap) => (
                                            <Link
                                                key={roadmap.key}
                                                to={roadmap.ctaTo}
                                                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-[#1a1921] dark:hover:bg-[#25242e]"
                                            >
                                                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{roadmap.title}</p>
                                                <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{roadmap.subtitle}</p>
                                                <p className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">Open roadmap →</p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={shellCardClass}>
                                <div className="mb-4 flex items-center justify-between pb-2">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Exam Subjects & Topics</h3>
                                    <Link to="/planora" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200">
                                        Open study platform
                                    </Link>
                                </div>

                                {subjectCards.length === 0 ? (
                                    <p className="text-sm text-slate-500">No exam subjects found. Create subjects and generate topics in the study platform.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {subjectCards.map((subject) => (
                                            <Link
                                                key={subject.key}
                                                to={subject.ctaTo}
                                                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-[#1a1921] dark:hover:bg-[#25242e]"
                                            >
                                                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{subject.title}</p>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subject.topicCount} topics</p>
                                                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                                                    {subject.strong} strong • {subject.weak} weak • {subject.notStarted} not started
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Progress & AI */}
                    <aside className="space-y-6 lg:col-span-4">
                        {/* EXECUTION FEED */}
                        <ExecutionFeed
                            tasks={activeTasks}
                            focusOpen={currentState === 'IN_PROGRESS'}
                            todayTask={todayTask}
                            streak={streak}
                        />

                        {/* 5. PROGRESS PANEL */}
                        <ProgressPanel tasks={activeTasks} stats={progress?.stats} />

                        {/* AI Insight Card */}
                        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 dark:from-[#1a1a2e] dark:to-[#121212] dark:border-white/10">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <BrainCircuit className="h-5 w-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                {coach?.reason || "Consistency is your superpower. One focused session today beats zero."}
                            </p>
                            <button
                                onClick={() => setVoicePanelOpen(true)}
                                className="mt-4 w-full rounded-xl bg-indigo-100 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
                            >
                                Get Strategy
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            <AIVoicePanel
                isOpen={voicePanelOpen}
                onClose={() => setVoicePanelOpen(false)}

            <TaskDetailModal
                task={selectedTask}
                isOpen={taskModalOpen}
                onClose={() => setTaskModalOpen(false)}
                onStartFocus={onStartFocusForTask}
            />
                contextSource="dashboard"
            />
        </div>
    );
};

export default ExecutionDashboard;
