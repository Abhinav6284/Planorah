import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, ThumbsUp, Timer, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import AIVoicePanel from '../Mentoring/AIVoicePanel';
import ModeSwitch from './Execution/ModeSwitch';

// New Architecture Components
import TodayExecution from './Execution/TodayExecution';
import FocusMode from './Execution/FocusMode';
import ExecutionFeed from './Execution/ExecutionFeed';
import ProgressPanel from './Execution/ProgressPanel';
import TaskDetailModal from './Execution/TaskDetailModal';
import PerformanceChart from './Execution/PerformanceChart';

import { useExecutionStore } from '../../store/useExecutionStore';
import { userService } from '../../api/userService';
import { roadmapService } from '../../api/roadmapService';
import { planoraService } from '../../api/planoraService';
import { useMissionFlow } from '../../hooks/useMissionFlow';

const shellCardClass = 'rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 shadow-soft dark:shadow-none';

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
    const [userStats, setUserStats] = useState(null);
    const [isTaskGuideOpen, setIsTaskGuideOpen] = useState(false);
    const [selectedGuideTask, setSelectedGuideTask] = useState(null);

    useEffect(() => {
        bootstrap();
        userService.getProfile().then(setProfile).catch(() => null);
        userService.getStatistics().then(setUserStats).catch(() => null);
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

    const onStartFocus = async (taskOverride = null) => {
        const focusTask = taskOverride
            ? {
                ...taskOverride,
                reason: taskOverride.reason || taskOverride.description || taskOverride.subtitle || '',
                estimated_time: taskOverride.estimated_time || `${taskOverride.estimated_minutes || taskOverride.estimatedMinutes || 25} min`,
            }
            : todayTask;

        if (taskOverride) {
            setTodayTask(focusTask);
        }

        setExecutionState('IN_PROGRESS');
        await handleStartFocus(focusTask);
    };

    const onComplete = async (minutes) => {
        await originalComplete(minutes);
        setExecutionState('COMPLETED');
        setTimeout(() => setExecutionState('NOT_STARTED'), 5000);
        // Refresh stats after completion
        setTimeout(() => {
            userService.getStatistics().then(setUserStats).catch(() => null);
            bootstrap();
        }, 1000);
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

    const handleOpenTaskGuide = useCallback((taskCard) => {
        if (!taskCard) {
            return;
        }
        setSelectedGuideTask(taskCard);
        setIsTaskGuideOpen(true);
    }, []);

    const handleCloseTaskGuide = useCallback(() => {
        setIsTaskGuideOpen(false);
    }, []);

    const activeTasks = useMemo(() => mode === 'exam' ? examTasks : tasks, [mode, examTasks, tasks]);
    const streak = userStats?.streak?.current || profile?.profile?.streak_count || progress?.stats?.current_streak || 0;

    // Merge stats from multiple sources (profile has XP, userStats has task counts, progress has focus data)
    const mergedStats = useMemo(() => ({
        xp_points: profile?.profile?.xp_points || progress?.stats?.xp_points || 0,
        current_streak: streak,
        tasks_completed: userStats?.overview?.completed_tasks || progress?.stats?.tasks_completed || 0,
        focus_minutes: progress?.stats?.focus_minutes || 0,
        level: progress?.stats?.level || 'Beginner',
    }), [profile, userStats, progress, streak]);

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
                id: task.id,
                tag: 'Pending',
                title: normalizeDisplayTitle(task.title),
                subtitle: task.description || (task?.scheduled_for ? `Scheduled for ${formatDateLabel(dateKey)}` : 'Pending task'),
                description: task.description || '',
                dateKey,
                status: task.status,
                estimatedMinutes: task.estimated_minutes || 25,
                estimated_minutes: task.estimated_minutes || 25,
                estimated_time: task.estimated_time || `${task.estimated_minutes || 25} min`,
                reason: task.reason || task.description || '',
                task_type: task.type || mode,
                related_links: Array.isArray(task.related_links) ? task.related_links : [],
            };
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey).push(card);
        });

        const orderedDates = Array.from(map.keys()).sort();
        return { map, orderedDates };
    }, [activeTasks, mode]);

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
        <div className={`min-h-screen text-gray-950 transition-colors duration-500 dark:text-white ${currentState === 'IN_PROGRESS' ? 'bg-[#050505]' : 'bg-[#F5F1E8] dark:bg-charcoalDark'}`}>

            {/* Focus Mode Overlay */}
            <AnimatePresence>
                {currentState === 'IN_PROGRESS' && (
                    <div
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-sm"
                    >
                        <FocusMode
                            open={true}
                            task={todayTask}
                            onClose={onCloseFocus}
                            onComplete={onComplete}
                            embedded={true}
                        />
                    </div>
                )}
            </AnimatePresence>

            <div className={`mx-auto max-w-[1320px] px-4 py-6 transition-all duration-500 lg:px-6 lg:py-8 ${currentState === 'IN_PROGRESS' ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>

                {/* GREETING BAR */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-950 dark:text-white">
                                Hello, <span className="text-terracotta">{profile?.user?.first_name || profile?.profile?.first_name || 'there'}</span>
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Track your progress. Keep your streak going!
                            </p>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6 2a1 1 0 000 2h8a1 1 0 100-2H6zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                            </svg>
                            <span className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>

                    {/* STATS ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        {/* Finished */}
                        <div className={shellCardClass}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Finished</p>
                                    <p className="text-3xl font-bold text-gray-950 dark:text-white mt-2">{mergedStats.tasks_completed}</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2">+8 tasks</p>
                                </div>
                                <div className="p-2.5 bg-emerald-500/15 rounded-lg">
                                    <ThumbsUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </div>

                        {/* Tracked */}
                        <div className={shellCardClass}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Tracked</p>
                                    <p className="text-3xl font-bold text-gray-950 dark:text-white mt-2">{Math.round((mergedStats.focus_minutes || 0) / 60)}h</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-2">-6 hours</p>
                                </div>
                                <div className="p-2.5 bg-blue-500/15 rounded-lg">
                                    <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>

                        {/* Efficiency */}
                        <div className={shellCardClass}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Efficiency</p>
                                    <p className="text-3xl font-bold text-gray-950 dark:text-white mt-2">{Math.min(100, Math.round(((mergedStats.tasks_completed || 0) / Math.max(activeTasks?.length || 1, 1)) * 100))}%</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2">+12%</p>
                                </div>
                                <div className="p-2.5 bg-amber-500/15 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1. MISSION CARD */}
                <div className="mb-8">
                    <TodayExecution
                        user={profile}
                        todayTask={todayTask}
                        tasks={activeTasks}
                        streak={streak}
                        onStartFocus={onStartFocus}
                        onChangeTask={handleChangeTask}
                        loading={loading.bootstrap}
                    />
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">

                    {/* LEFT COLUMN: Main Activities */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Mode Switcher Block */}
                        <div className={`${shellCardClass} flex items-center justify-between gap-4`}>
                            <div className="flex items-center gap-3">
                                <ModeSwitch mode={mode} onChange={setMode} />
                                <span className="text-sm text-gray-400 hidden sm:inline font-medium">
                                    {mode === 'learning' ? 'Learning' : 'Exam'} Mode
                                </span>
                            </div>
                            <button
                                onClick={() => setVoicePanelOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-terracotta/15 hover:bg-terracotta/25 border border-terracotta/30 text-terracotta font-semibold text-sm transition-all dark:bg-terracotta/10 dark:hover:bg-terracotta/20"
                            >
                                <Sparkles className="h-4 w-4" />
                                <span className="hidden sm:inline">AI Coach</span>
                            </button>
                        </div>

                        {/* Performance Chart */}
                        <PerformanceChart tasks={activeTasks} />

                        {/* Schedule Section */}
                        <div className={shellCardClass}>
                            <div className="mb-4 flex items-center justify-between pb-2">
                                <h3 className="text-lg font-bold text-gray-950 dark:text-white">Schedule</h3>
                                <span className="text-xs font-semibold text-textSecondary dark:text-gray-500">Days</span>
                            </div>

                            {pendingTaskData.orderedDates.length === 0 && (
                                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">No pending tasks. You're all caught up!</p>
                            )}

                            <div className="space-y-4">
                                <div className="flex gap-2.5 overflow-x-auto pb-2">
                                    {scheduleDays.map((day) => (
                                        <button
                                            key={day.key}
                                            type="button"
                                            onClick={() => setSelectedDateKey(day.key)}
                                            className={`flex h-14 w-11 flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl font-semibold transition-all border ${day.isSelected
                                                ? 'bg-terracotta text-white border-terracotta'
                                                : 'bg-white/80 dark:bg-white/5 border-gray-200 dark:border-white/20 text-textPrimary dark:text-gray-300 hover:bg-white/90 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="text-sm font-bold">{day.dayNumber}</span>
                                            <span className="text-[9px]">{day.dayName}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-gray-950 dark:text-white">Tasks ({selectedTasks.length})</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-borderMuted dark:bg-white/10">
                                            <div className="h-full rounded-full bg-terracotta transition-all" style={{ width: `${selectedTaskProgress}%` }} />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{selectedTaskProgress}%</span>
                                    </div>
                                </div>

                                {selectedTasks.length === 0 ? (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">No tasks scheduled for {formatDateLabel(selectedDateKey)}.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedTasks.map((card, index) => (
                                            <div
                                                key={card.key}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => handleOpenTaskGuide(card)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter' || event.key === ' ') {
                                                        event.preventDefault();
                                                        handleOpenTaskGuide(card);
                                                    }
                                                }}
                                                className="relative flex cursor-pointer items-center gap-4 p-4 bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/20 rounded-xl hover:bg-white/90 dark:hover:bg-white/10 transition-all group"
                                            >
                                                {/* Number Badge */}
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta/15 border border-terracotta/30 text-sm font-bold text-terracotta">
                                                    {index + 1}
                                                </div>

                                                {/* Info */}
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="truncate text-sm font-semibold text-gray-950 dark:text-white group-hover:text-terracotta transition-colors">
                                                        {card.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                        ⏱ {card.estimatedMinutes} min
                                                    </p>
                                                </div>

                                                {/* Status */}
                                                <span className="text-xs px-3 py-1.5 rounded-lg bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-textSecondary dark:text-gray-300">
                                                    {getTaskStatusLabel(card.status)}
                                                </span>
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
                                    <h3 className="text-lg font-bold text-gray-950 dark:text-white">Learning Path Roadmaps</h3>
                                    <Link to="/roadmap/list" className="text-xs font-semibold text-terracotta hover:text-terracottaHover">
                                        View all
                                    </Link>
                                </div>

                                {roadmapCards.length === 0 ? (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">No roadmaps found. Create one to link tasks with your learning path.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {roadmapCards.map((roadmap) => (
                                            <Link
                                                key={roadmap.key}
                                                to={roadmap.ctaTo}
                                                className="rounded-xl border border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-white/5 p-3 transition hover:bg-white/70 dark:hover:bg-white/10"
                                            >
                                                <p className="truncate text-sm font-semibold text-gray-950 dark:text-white">{roadmap.title}</p>
                                                <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{roadmap.subtitle}</p>
                                                <p className="mt-2 text-[11px] font-semibold text-terracotta">Open roadmap →</p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={shellCardClass}>
                                <div className="mb-4 flex items-center justify-between pb-2">
                                    <h3 className="text-lg font-bold text-gray-950 dark:text-white">Exam Subjects & Topics</h3>
                                    <Link to="/planora" className="text-xs font-semibold text-terracotta hover:text-terracottaHover">
                                        Open study platform
                                    </Link>
                                </div>

                                {subjectCards.length === 0 ? (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">No exam subjects found. Create subjects and generate topics in the study platform.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {subjectCards.map((subject) => (
                                            <Link
                                                key={subject.key}
                                                to={subject.ctaTo}
                                                className="rounded-xl border border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-white/5 p-3 transition hover:bg-white/70 dark:hover:bg-white/10"
                                            >
                                                <p className="truncate text-sm font-semibold text-gray-950 dark:text-white">{subject.title}</p>
                                                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{subject.topicCount} topics</p>
                                                <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400">
                                                    {subject.strong} strong • {subject.weak} weak • {subject.notStarted} not started
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Feed, Progress & AI */}
                    <aside className="space-y-6 lg:col-span-4">
                        {/* 4. EXECUTION FEED */}
                        <ExecutionFeed
                            tasks={activeTasks}
                            focusOpen={currentState === 'IN_PROGRESS'}
                            todayTask={todayTask}
                            streak={streak}
                        />

                        {/* 5. PROGRESS PANEL */}
                        <ProgressPanel tasks={activeTasks} stats={mergedStats} />

                        {/* AI Insight Card */}
                        <div className="rounded-2xl border border-terracotta/30 bg-white dark:bg-gradient-to-br dark:from-terracotta/5 dark:via-transparent dark:to-transparent p-5 shadow-soft dark:shadow-none dark:border-terracotta/20">
                            <div className="flex items-center gap-2 text-terracotta">
                                <BrainCircuit className="h-4 w-4" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">AI Insight</span>
                            </div>
                            <p className="mt-2.5 text-sm leading-relaxed text-textPrimary dark:text-gray-300">
                                {coach?.reason || "Consistency is your superpower. One focused session today beats zero."}
                            </p>
                            <button
                                onClick={() => setVoicePanelOpen(true)}
                                className="mt-4 w-full rounded-lg bg-terracotta/15 dark:bg-terracotta/10 py-2.5 px-4 text-sm font-semibold text-terracotta hover:bg-terracotta/25 dark:hover:bg-terracotta/20 transition-colors"
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
                contextSource="dashboard"
            />

            <TaskDetailModal
                task={selectedGuideTask}
                isOpen={isTaskGuideOpen}
                onClose={handleCloseTaskGuide}
                onStartFocus={onStartFocus}
            />
        </div>
    );
};

export default ExecutionDashboard;
