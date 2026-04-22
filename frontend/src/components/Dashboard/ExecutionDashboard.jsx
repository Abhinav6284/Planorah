import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrainCircuit, Flame, Sparkles, CheckCircle2, Clock, Zap, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTour } from '../Tour/TourContext';

import AIVoicePanel from '../Mentoring/AIVoicePanel';
import ModeSwitch from './Execution/ModeSwitch';

// New Architecture Components
import TodayExecution from './Execution/TodayExecution';
import FocusMode from './Execution/FocusMode';
import ExecutionFeed from './Execution/ExecutionFeed';
import ProgressPanel from './Execution/ProgressPanel';
import TaskDetailModal from './Execution/TaskDetailModal';
import PerformanceChart from './Execution/PerformanceChart';
import SessionsSection from '../Sessions/SessionsSection';

import { useExecutionStore } from '../../store/useExecutionStore';
import { userService } from '../../api/userService';
import { roadmapService } from '../../api/roadmapService';
import { planoraService } from '../../api/planoraService';
import { useMissionFlow } from '../../hooks/useMissionFlow';
import api from '../../api/axios';

const shellCardClass = 'rounded-2xl border-0 bg-white dark:bg-[#1a1a1a] p-6 transition-all duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]';

const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

const buildDateKey = (dateValue) => {
    if (!dateValue) {
        return null;
    }

    // Keep date-only strings stable across timezones.
    if (typeof dateValue === 'string') {
        const dateOnly = dateValue.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
            return dateOnly;
        }
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

const resolveTaskDateKey = (task) => {
    if (!task) {
        return null;
    }
    return buildDateKey(task.scheduled_for) || buildDateKey(task.created_at);
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
    const [chartData, setChartData] = useState(null);
    const [isTaskGuideOpen, setIsTaskGuideOpen] = useState(false);
    const [selectedGuideTask, setSelectedGuideTask] = useState(null);

    useEffect(() => {
        bootstrap();
        // Batch all 5 API calls in parallel — React 18 batches the setState calls automatically
        Promise.all([
            userService.getProfile(),
            userService.getStatistics(),
            api.get('analytics/activity_chart/', { params: { days: 7 } }),
            roadmapService.getUserRoadmaps(),
            planoraService.getSubjects(),
        ]).then(([profileData, statsData, chartRes, roadmapsData, subjectsData]) => {
            setProfile(profileData);
            setUserStats(statsData);
            setChartData(chartRes?.data ?? null);
            setRoadmaps(Array.isArray(roadmapsData) ? roadmapsData : []);
            setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        }).catch(() => null);
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

    const onStartFocus = useCallback(async (taskOverride = null) => {
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
    }, [todayTask, setTodayTask, setExecutionState, handleStartFocus]);

    const onComplete = useCallback(async (minutes) => {
        await originalComplete(minutes);
        setExecutionState('COMPLETED');
        setTimeout(() => setExecutionState('NOT_STARTED'), 5000);
        // Refresh dashboard stats after completion (bootstrap already refreshes store)
        setTimeout(() => {
            Promise.all([
                userService.getStatistics(),
                api.get('analytics/activity_chart/', { params: { days: 7 } }),
            ]).then(([statsData, chartRes]) => {
                setUserStats(statsData);
                setChartData(chartRes?.data ?? null);
            }).catch(() => null);
            bootstrap();
        }, 1000);
    }, [originalComplete, setExecutionState, bootstrap]);

    const onCloseFocus = useCallback(() => {
        setExecutionState('NOT_STARTED');
    }, [setExecutionState]);

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

    const openVoicePanel = useCallback(() => setVoicePanelOpen(true), []);
    const closeVoicePanel = useCallback(() => setVoicePanelOpen(false), []);

    const { start: startTour } = useTour();

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

    // Build day-wise buckets from actual task dates (pending + completed).
    const scheduledTaskData = useMemo(() => {
        const statusOrder = {
            in_progress: 0,
            pending: 1,
            not_started: 1,
            completed: 2,
        };

        const withDate = (activeTasks || [])
            .map((task) => {
                const dateKey = resolveTaskDateKey(task) || buildDateKey(new Date());
                return { task, dateKey };
            })
            .sort((a, b) => {
                const byDate = a.dateKey.localeCompare(b.dateKey);
                if (byDate !== 0) {
                    return byDate;
                }
                const aCreated = new Date(a.task?.created_at || 0).getTime();
                const bCreated = new Date(b.task?.created_at || 0).getTime();
                return aCreated - bCreated;
            });

        const map = new Map();
        withDate.forEach(({ task, dateKey }) => {
            const card = {
                key: task.id,
                id: task.id,
                tag: task.status === 'completed' ? 'Completed' : 'Pending',
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

        map.forEach((cards, key) => {
            cards.sort((a, b) => {
                const rankA = statusOrder[a.status] ?? 99;
                const rankB = statusOrder[b.status] ?? 99;
                if (rankA !== rankB) {
                    return rankA - rankB;
                }
                return a.title.localeCompare(b.title);
            });
            map.set(key, cards);
        });

        const orderedDates = Array.from(map.keys()).sort();
        return { map, orderedDates };
    }, [activeTasks, mode]);

    useEffect(() => {
        const todayKey = buildDateKey(new Date());

        if (!scheduledTaskData.orderedDates.length) {
            if (selectedDateKey !== todayKey) {
                setSelectedDateKey(todayKey);
            }
            return;
        }

        if (selectedDateKey && scheduledTaskData.map.has(selectedDateKey)) {
            return;
        }

        const nextDateKey = scheduledTaskData.map.has(todayKey)
            ? todayKey
            : (scheduledTaskData.orderedDates.find((dateKey) => dateKey >= todayKey) || scheduledTaskData.orderedDates[0]);

        if (nextDateKey !== selectedDateKey) {
            setSelectedDateKey(nextDateKey);
        }
    }, [scheduledTaskData.orderedDates, scheduledTaskData.map, selectedDateKey]);

    const selectedTasks = useMemo(() => {
        const tasksForDate = scheduledTaskData.map.get(selectedDateKey) || [];
        return tasksForDate.slice(0, 6);
    }, [scheduledTaskData.map, selectedDateKey]);

    const selectedTaskProgress = useMemo(() => {
        if (!selectedTasks.length) {
            return 0;
        }
        const completed = selectedTasks.filter((task) => task.status === 'completed').length;
        return Math.round((completed / selectedTasks.length) * 100);
    }, [selectedTasks]);

    const scheduleDays = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const anchorDate = (() => {
            if (selectedDateKey) {
                const selectedDate = new Date(`${selectedDateKey}T00:00:00`);
                if (!Number.isNaN(selectedDate.getTime())) {
                    return selectedDate;
                }
            }

            if (scheduledTaskData.orderedDates.length) {
                const todayKey = buildDateKey(today);
                const nearestDateKey = scheduledTaskData.orderedDates.find((dateKey) => dateKey >= todayKey)
                    || scheduledTaskData.orderedDates[scheduledTaskData.orderedDates.length - 1];
                const nearestDate = new Date(`${nearestDateKey}T00:00:00`);
                if (!Number.isNaN(nearestDate.getTime())) {
                    return nearestDate;
                }
            }

            return today;
        })();

        const windowStart = new Date(anchorDate);
        windowStart.setDate(anchorDate.getDate() - 6);

        return buildDateRange(windowStart, 14).map((day) => ({
            ...day,
            isSelected: day.key === selectedDateKey,
            hasTasks: scheduledTaskData.map.has(day.key),
        }));
    }, [scheduledTaskData.orderedDates, scheduledTaskData.map, selectedDateKey]);

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

                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Dashboard</p>
                            <h1 className="text-2xl font-semibold text-gray-950 dark:text-white">
                                {getTimeBasedGreeting()}, {profile?.user?.first_name || profile?.profile?.first_name || 'there'}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        {/* Tour trigger button */}
                        <button
                            onClick={startTour}
                            title="Take a guided tour"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:border-terracotta/50 hover:text-terracotta dark:hover:text-terracotta transition-all"
                        >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Take tour</span>
                        </button>
                    </div>

                    {/* Inline Stats Pills */}
                    <div data-tour="header-stats" className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-sm font-medium text-gray-600 dark:text-gray-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-terracotta" />
                            <span>{mergedStats.tasks_completed} done</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-sm font-medium text-gray-600 dark:text-gray-300">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>{Math.round((mergedStats.focus_minutes || 0) / 60)}h tracked</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-sm font-medium text-gray-600 dark:text-gray-300">
                            <Zap className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{Math.min(100, Math.round(((mergedStats.tasks_completed || 0) / Math.max(activeTasks?.length || 1, 1)) * 100))}% efficiency</span>
                        </div>
                        {streak > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-terracotta/30 bg-terracotta/10 text-sm font-medium text-terracotta">
                                <Flame className="w-3.5 h-3.5" />
                                <span>{streak}d streak</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* HERO: TODAY'S MISSION */}
                <div data-tour="today-mission" className="mb-8">
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

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                    {/* LEFT COLUMN: Main Activities */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Mode Switcher — compact */}
                        <div data-tour="mode-switch" className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <ModeSwitch mode={mode} onChange={setMode} />
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold hidden sm:inline">
                                    {mode === 'learning' ? 'Learning' : 'Exam'} Mode
                                </span>
                            </div>
                            <button
                                data-tour="ai-coach-btn"
                                onClick={openVoicePanel}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-terracotta hover:bg-terracottaHover text-white font-semibold text-xs sm:text-sm transition-all active:scale-95"
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">AI Coach</span>
                            </button>
                        </div>

                        {/* Schedule Section */}
                        <div data-tour="schedule" className={shellCardClass}>
                            <div className="mb-4 flex items-center justify-between pb-2">
                                <h3 className="text-lg font-bold text-gray-950 dark:text-white">Schedule</h3>
                                <span className="text-xs font-semibold text-textSecondary dark:text-gray-500">Days</span>
                            </div>

                            {scheduledTaskData.orderedDates.length === 0 && (
                                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">No tasks scheduled yet. Generate tasks to start your daily timeline.</p>
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
                                                : day.hasTasks
                                                    ? 'bg-white/80 dark:bg-white/5 border-terracotta/40 dark:border-terracotta/35 text-textPrimary dark:text-gray-200 hover:bg-white/90 dark:hover:bg-white/10'
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
                                    <div className="space-y-2">
                                        {selectedTasks.map((card) => (
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
                                                className="relative flex cursor-pointer items-center gap-3 p-3 bg-white/80 dark:bg-white/5 border-l-4 border-r border-t border-b border-gray-200 dark:border-white/20 rounded-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all group"
                                                style={{ borderLeftColor: card.status === 'completed' ? '#10b981' : card.status === 'in_progress' ? '#d96c4a' : '#d1d5db' }}
                                            >
                                                {/* Info */}
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="truncate text-sm font-semibold text-gray-950 dark:text-white group-hover:text-terracotta transition-colors">
                                                        {card.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                                        {card.estimatedMinutes} min
                                                    </p>
                                                </div>

                                                {/* Status Pill */}
                                                <span className={`text-xs px-2.5 py-1 rounded-md font-semibold whitespace-nowrap ${card.status === 'completed' ? 'bg-emerald-100/50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' :
                                                        card.status === 'in_progress' ? 'bg-terracotta/15 text-terracotta' :
                                                            'bg-gray-100/50 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                                                    }`}>
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
                            <div data-tour="linked-section" className={shellCardClass}>
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
                            <div data-tour="linked-section" className={shellCardClass}>
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

                        {/* Performance Chart — below the fold */}
                        <PerformanceChart tasks={activeTasks} chartData={chartData} />
                    </div>

                    {/* RIGHT COLUMN: Feed, Progress & AI */}
                    <aside className="space-y-6 lg:col-span-4">
                        {/* 4. EXECUTION FEED */}
                        <div data-tour="execution-feed">
                            <ExecutionFeed
                                tasks={activeTasks}
                                focusOpen={currentState === 'IN_PROGRESS'}
                                todayTask={todayTask}
                                streak={streak}
                                recentActivity={userStats?.recent_activity}
                            />
                        </div>

                        {/* 5. PROGRESS PANEL */}
                        <div data-tour="progress-panel">
                            <ProgressPanel tasks={activeTasks} stats={mergedStats} activityHeatmap={userStats?.activity_heatmap} />
                        </div>

                        {/* Sessions Section */}
                        <SessionsSection />

                        {/* AI Insight Card */}
                        <div data-tour="ai-insight" className="rounded-2xl border border-terracotta/30 bg-white dark:bg-gradient-to-br dark:from-terracotta/5 dark:via-transparent dark:to-transparent p-5 shadow-soft dark:shadow-none dark:border-terracotta/20">
                            <div className="flex items-center gap-2 text-terracotta">
                                <BrainCircuit className="h-4 w-4" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">AI Insight</span>
                            </div>
                            <p className="mt-2.5 text-sm leading-relaxed text-textPrimary dark:text-gray-300">
                                {coach?.reason || "Consistency is your superpower. One focused session today beats zero."}
                            </p>
                            <button
                                onClick={openVoicePanel}
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
                onClose={closeVoicePanel}
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
