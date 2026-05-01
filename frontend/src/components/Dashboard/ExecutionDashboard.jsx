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

const shellCardClass = 'rounded-2xl p-6 transition-all duration-300';
const shellCardStyle = {
    background: 'var(--el-bg)',
    border: '1px solid var(--el-border)',
    boxShadow: 'var(--el-shadow-card)',
};

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
        <div className={`min-h-screen transition-colors duration-300`} style={{ background: currentState === 'IN_PROGRESS' ? '#000' : 'var(--el-bg)', color: 'var(--el-text)', fontFamily: "'Inter', sans-serif" }}>

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

            <div className={`mx-auto px-4 py-6 transition-all duration-500 lg:px-8 lg:py-8 ${currentState === 'IN_PROGRESS' ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`} style={{ maxWidth: 1200 }}>

                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--el-text-muted)', marginBottom: 6 }}>My Workspace</p>
                            <h1 style={{ fontSize: 32, fontWeight: 300, color: 'var(--el-text)', letterSpacing: '-0.04em', lineHeight: 1.1, fontFamily: "'Inter', sans-serif" }}>
                                {getTimeBasedGreeting()}, {profile?.user?.first_name || profile?.profile?.first_name || 'there'}
                            </h1>
                        </div>
                        {/* Tour trigger button */}
                        <button
                            onClick={startTour}
                            title="Take a guided tour"
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 9999, border: '1px solid var(--el-border)', background: 'var(--el-bg)', fontSize: 13, fontWeight: 500, color: 'var(--el-text-secondary)', cursor: 'pointer', boxShadow: 'var(--el-shadow-inset)', transition: 'all 0.15s' }}
                        >
                            <HelpCircle style={{ width: 14, height: 14 }} />
                            <span className="hidden sm:inline">Take tour</span>
                        </button>
                    </div>

                    {/* Inline Stats Pills */}
                    <div data-tour="header-stats" className="flex flex-wrap items-center gap-2">
                        {[
                            { icon: CheckCircle2, text: `${mergedStats.tasks_completed} done` },
                            { icon: Clock, text: `${Math.round((mergedStats.focus_minutes || 0) / 60)}h tracked` },
                            { icon: Zap, text: `${Math.min(100, Math.round(((mergedStats.tasks_completed || 0) / Math.max(activeTasks?.length || 1, 1)) * 100))}% efficiency` },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 9999, border: '1px solid var(--el-border)', background: 'var(--el-bg)', fontSize: 13, fontWeight: 500, color: 'var(--el-text-secondary)', boxShadow: 'var(--el-shadow-inset)' }}>
                                <Icon style={{ width: 14, height: 14, color: 'var(--el-text)' }} />
                                <span>{text}</span>
                            </div>
                        ))}
                        {streak > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 9999, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)', fontSize: 13, fontWeight: 600, color: 'var(--el-text)', boxShadow: 'var(--el-shadow-inset)' }}>
                                <Flame style={{ width: 14, height: 14 }} />
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
                        <div data-tour="mode-switch" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 16px', borderRadius: 16, background: 'var(--el-bg)', border: '1px solid var(--el-border)', boxShadow: 'var(--el-shadow-card)' }}>
                            <div className="flex items-center gap-3">
                                <ModeSwitch mode={mode} onChange={setMode} />
                                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--el-text-secondary)' }} className="hidden sm:inline">
                                    {mode === 'learning' ? 'Learning' : 'Exam'} Mode
                                </span>
                            </div>
                            <button
                                data-tour="ai-coach-btn"
                                onClick={openVoicePanel}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 9999, background: 'var(--el-text)', color: 'var(--el-bg)', fontWeight: 500, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'opacity 0.15s', fontFamily: "'Inter', sans-serif" }}
                            >
                                <Sparkles style={{ width: 14, height: 14 }} />
                                <span className="hidden sm:inline">AI Coach</span>
                            </button>
                        </div>

                        {/* Schedule Section */}
                        <div data-tour="schedule" className={shellCardClass} style={shellCardStyle}>
                            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--el-border-subtle)' }}>
                                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--el-text)' }}>Schedule</h3>
                                <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--el-text-muted)' }}>Days</span>
                            </div>

                            {scheduledTaskData.orderedDates.length === 0 && (
                                <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--el-text-secondary)' }}>No tasks scheduled yet. Generate tasks to start your daily timeline.</p>
                            )}

                            <div className="space-y-4">
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {scheduleDays.map((day) => (
                                        <button
                                            key={day.key}
                                            type="button"
                                            onClick={() => setSelectedDateKey(day.key)}
                                            style={{
                                                display: 'flex', height: 56, width: 40, flexShrink: 0,
                                                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                gap: 2, borderRadius: 10, fontWeight: 600, transition: 'all 0.15s',
                                                border: `1px solid ${day.isSelected ? 'var(--el-text)' : 'var(--el-border)'}`,
                                                background: day.isSelected ? 'var(--el-text)' : day.hasTasks ? 'var(--el-bg)' : 'var(--el-bg)',
                                                color: day.isSelected ? 'var(--el-bg)' : 'var(--el-text)',
                                                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                            }}
                                        >
                                            <span style={{ fontSize: 14, fontWeight: 700 }}>{day.dayNumber}</span>
                                            <span style={{ fontSize: 9, opacity: 0.6 }}>{day.dayName}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between">
                                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--el-text)' }}>Tasks ({selectedTasks.length})</p>
                                    <div className="flex items-center gap-3">
                                        <div style={{ height: 6, width: 96, overflow: 'hidden', borderRadius: 9999, background: 'var(--el-bg-secondary)' }}>
                                            <div style={{ height: '100%', borderRadius: 9999, background: 'var(--el-text)', transition: 'width 0.3s', width: `${selectedTaskProgress}%` }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--el-text-muted)' }}>{selectedTaskProgress}%</span>
                                    </div>
                                </div>

                                {selectedTasks.length === 0 ? (
                                    <p style={{ fontSize: 14, color: 'var(--el-text-secondary)' }}>No tasks scheduled for {formatDateLabel(selectedDateKey)}.</p>
                                ) : (
                                    <div className="space-y-1.5">
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
                                                style={{
                                                    position: 'relative', display: 'flex', cursor: 'pointer',
                                                    alignItems: 'center', gap: 12, padding: 12,
                                                    background: 'var(--el-bg)', borderRadius: 10,
                                                    border: '1px solid var(--el-border)',
                                                    borderLeft: `3px solid ${card.status === 'completed' ? '#10b981' : card.status === 'in_progress' ? 'var(--el-text)' : 'var(--el-border)'}`,
                                                    transition: 'background 0.15s',
                                                }}
                                            >
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--el-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {card.title}
                                                    </h4>
                                                    <p style={{ fontSize: 12, color: 'var(--el-text-muted)', marginTop: 2 }}>
                                                        {card.estimatedMinutes} min
                                                    </p>
                                                </div>
                                                <span style={{
                                                    fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600, whiteSpace: 'nowrap',
                                                    background: card.status === 'completed' ? '#ecfdf5' : 'var(--el-bg-secondary)',
                                                    color: card.status === 'completed' ? '#059669' : card.status === 'in_progress' ? 'var(--el-text)' : 'var(--el-text-muted)',
                                                }}>
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
                            <div data-tour="linked-section" className={shellCardClass} style={shellCardStyle}>
                                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--el-border-subtle)' }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--el-text)' }}>Learning Path Roadmaps</h3>
                                    <Link to="/roadmap/list" style={{ fontSize: 12, fontWeight: 500, color: 'var(--el-text-muted)', textDecoration: 'none' }}>
                                        View all →
                                    </Link>
                                </div>

                                {roadmapCards.length === 0 ? (
                                    <p style={{ fontSize: 14, color: 'var(--el-text-secondary)', letterSpacing: '0.16px' }}>No roadmaps found. Create one to link tasks with your learning path.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {roadmapCards.map((roadmap) => (
                                            <Link
                                                key={roadmap.key}
                                                to={roadmap.ctaTo}
                                                style={{ display: 'block', padding: 12, borderRadius: 12, border: '1px solid var(--el-border)', background: 'var(--el-bg-secondary)', textDecoration: 'none', transition: 'background 0.15s' }}
                                            >
                                                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--el-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{roadmap.title}</p>
                                                <p className="line-clamp-2" style={{ marginTop: 4, fontSize: 12, color: 'var(--el-text-secondary)' }}>{roadmap.subtitle}</p>
                                                <p style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: 'var(--el-text)' }}>Open →</p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div data-tour="linked-section" className={shellCardClass} style={shellCardStyle}>
                                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--el-border-subtle)' }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--el-text)' }}>Exam Subjects & Topics</h3>
                                    <Link to="/planora" style={{ fontSize: 12, fontWeight: 500, color: 'var(--el-text-muted)', textDecoration: 'none' }}>
                                        Open →
                                    </Link>
                                </div>

                                {subjectCards.length === 0 ? (
                                    <p style={{ fontSize: 14, color: 'var(--el-text-secondary)', letterSpacing: '0.16px' }}>No exam subjects found. Create subjects and generate topics in the study platform.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {subjectCards.map((subject) => (
                                            <Link
                                                key={subject.key}
                                                to={subject.ctaTo}
                                                style={{ display: 'block', padding: 12, borderRadius: 12, border: '1px solid var(--el-border)', background: 'var(--el-bg-secondary)', textDecoration: 'none', transition: 'background 0.15s' }}
                                            >
                                                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--el-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subject.title}</p>
                                                <p style={{ marginTop: 4, fontSize: 12, color: 'var(--el-text-secondary)' }}>{subject.topicCount} topics</p>
                                                <p style={{ marginTop: 8, fontSize: 11, color: 'var(--el-text-muted)' }}>
                                                    {subject.strong} strong · {subject.weak} weak · {subject.notStarted} not started
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
                        <div data-tour="ai-insight" className={shellCardClass} style={{ ...shellCardStyle, padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--el-text)', marginBottom: 10 }}>
                                <BrainCircuit style={{ width: 16, height: 16 }} />
                                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Insight</span>
                            </div>
                            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--el-text-secondary)', letterSpacing: '0.14px' }}>
                                {coach?.reason || "Consistency is your superpower. One focused session today beats zero."}
                            </p>
                            <button
                                onClick={openVoicePanel}
                                style={{ marginTop: 16, width: '100%', padding: '10px 16px', borderRadius: 9999, background: 'var(--el-text)', color: 'var(--el-bg)', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'opacity 0.15s', fontFamily: "'Inter', sans-serif" }}
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
