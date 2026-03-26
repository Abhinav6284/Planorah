import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Flame, Star, Medal, Crown, Sparkles, BrainCircuit, CheckCircle2, Timer, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

import AIVoicePanel from '../Mentoring/AIVoicePanel';
import DateTasksWidget from './NewWidgets/DateTasksWidget';
import ProfileCard from './NewWidgets/ProfileCard';
import CalendarWidget from './NewWidgets/CalendarWidget';

import FocusMode from './Execution/FocusMode';
import ModeSwitch from './Execution/ModeSwitch';

import { useExecutionStore } from '../../store/useExecutionStore';
import { userService } from '../../api/userService';
import { useMissionFlow } from '../../hooks/useMissionFlow';
import { roadmapService } from '../../api/roadmapService';
import { planoraService } from '../../api/planoraService';

const shellCardClass = 'rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-[#121212] dark:shadow-none';
const secondaryButtonClass = 'rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10';

const LEAGUE_TIERS = [
    { name: 'Bronze League', min: 0, max: 499, accent: 'text-amber-700', chip: 'bg-amber-100 text-amber-700' },
    { name: 'Silver League', min: 500, max: 999, accent: 'text-slate-700', chip: 'bg-slate-200 text-slate-700' },
    { name: 'Gold League', min: 1000, max: 1699, accent: 'text-yellow-700', chip: 'bg-yellow-100 text-yellow-700' },
    { name: 'Platinum League', min: 1700, max: 2599, accent: 'text-cyan-700', chip: 'bg-cyan-100 text-cyan-700' },
    { name: 'Diamond League', min: 2600, max: 999999, accent: 'text-indigo-700', chip: 'bg-indigo-100 text-indigo-700' },
];

const LEAGUE_TIER_STYLES = {
    'Bronze League': { accent: 'text-amber-700', chip: 'bg-amber-100 text-amber-700' },
    'Silver League': { accent: 'text-slate-700', chip: 'bg-slate-200 text-slate-700' },
    'Gold League': { accent: 'text-yellow-700', chip: 'bg-yellow-100 text-yellow-700' },
    'Platinum League': { accent: 'text-cyan-700', chip: 'bg-cyan-100 text-cyan-700' },
    'Diamond League': { accent: 'text-indigo-700', chip: 'bg-indigo-100 text-indigo-700' },
};

const XP_LEVELS = [
    { level: 'Beginner', min: 0, max: 499 },
    { level: 'Focused', min: 500, max: 1499 },
    { level: 'Elite', min: 1500, max: 999999 },
];

const ExecutionDashboard = () => {
    const {
        mode,
        setMode,
        todayTask,
        coach,
        tasks,
        examTasks,
        progress,
        activeExamPlan,
        loading,
        bootstrap,
        regenerateCoach,
        updateTaskStatus,
        createFocusSession,
        updateFocusSession,
        applyRewards,
        createExamPlan,
        refreshTodayTask,
        setTodayTask,
    } = useExecutionStore();

    const [profile, setProfile] = useState(null);
    const [voicePanelOpen, setVoicePanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('activities');
    const [roadmaps, setRoadmaps] = useState([]);
    const [roadmapsLoading, setRoadmapsLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [subjectsLoading, setSubjectsLoading] = useState(true);

    useEffect(() => {
        bootstrap();
        userService.getProfile().then(setProfile).catch(() => null);
        roadmapService
            .getUserRoadmaps()
            .then((data) => setRoadmaps(Array.isArray(data) ? data : []))
            .catch(() => setRoadmaps([]))
            .finally(() => setRoadmapsLoading(false));

        planoraService
            .getSubjects()
            .then((data) => setSubjects(Array.isArray(data) ? data : []))
            .catch(() => setSubjects([]))
            .finally(() => setSubjectsLoading(false));
    }, [bootstrap]);

    const displayName = useMemo(() => {
        const firstName = profile?.first_name;
        if (firstName) return firstName;
        return profile?.username || 'there';
    }, [profile]);

    const {
        focusOpen,
        setFocusOpen,
        rewardPulse,
        handleStartFocus,
        handleFocusComplete,
    } = useMissionFlow({
        todayTask,
        createFocusSession,
        updateFocusSession,
        updateTaskStatus,
        applyRewards,
        refreshTodayTask,
    });

    const handleChangeTask = useCallback(async () => {
        const next = await regenerateCoach();
        setTodayTask((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                title: next.task,
                reason: next.reason,
                difficulty: next.difficulty,
                estimated_time: next.estimated_time,
            };
        });
    }, [regenerateCoach, setTodayTask]);

    const stats = progress?.stats || {};
    const currentStreak = stats.streak || stats.current_streak || 0;
    const xpPoints = stats.xp_points || stats.xp || 0;

    const allExecutionTasks = useMemo(() => ([...(tasks || []), ...(examTasks || [])]), [tasks, examTasks]);

    const todayActivityCards = useMemo(() => {
        const todayISO = new Date().toISOString().slice(0, 10);
        const pendingForToday = (tasks || []).filter((task) => {
            const status = task?.status;
            if (!(status === 'pending' || status === 'in_progress')) return false;
            if (!task?.scheduled_for) return false;
            return String(task.scheduled_for).slice(0, 10) === todayISO;
        });

        const list = pendingForToday.slice(0, 3).map((task) => ({
            key: task.id,
            tag: 'Today',
            type: mode === 'exam' ? 'Exam' : 'Task',
            title: task.title,
            subtitle: task.reason || `${task.estimated_time || '25 min'} planned for today`,
            ctaTo: '/tasks',
        }));

        if (!list.length && todayTask) {
            list.push({
                key: todayTask.id || 'today-task-fallback',
                tag: 'Today',
                type: mode === 'exam' ? 'Exam' : 'Task',
                title: todayTask.title,
                subtitle: todayTask.reason || 'Recommended task for today from your execution engine.',
                ctaTo: '/tasks',
            });
        }

        return list;
    }, [mode, tasks, todayTask]);

    const learningPathCards = useMemo(() => {
        return (roadmaps || []).slice(0, 3).map((roadmap) => ({
            key: roadmap.id,
            tag: 'Path',
            type: roadmap.difficulty_level ? roadmap.difficulty_level.charAt(0).toUpperCase() + roadmap.difficulty_level.slice(1) : 'Path',
            title: roadmap.title,
            subtitle: roadmap.overview || 'Open this learning path to continue your milestones.',
            ctaTo: `/roadmap/${roadmap.id}`,
        }));
    }, [roadmaps]);

    const examSubjectCards = useMemo(() => {
        return (subjects || []).slice(0, 3).map((subject) => {
            const ps = subject.progress_summary || {};
            const notStarted = ps.not_started || 0;
            const weak = ps.weak || 0;
            const strong = ps.strong || 0;
            const total = ps.total || (notStarted + weak + strong);

            return {
                key: subject.id,
                tag: 'Subject',
                type: 'Exam',
                title: subject.name,
                subtitle: total
                    ? `${total} topics • ${strong} strong • ${weak} weak • ${notStarted} not started`
                    : (subject.description || 'Open this subject to study topics, notes, and guide.'),
                ctaTo: `/planora/subject/${subject.id}`,
            };
        });
    }, [subjects]);

    const activeCards = useMemo(() => {
        if (activeTab === 'paths') return learningPathCards;
        if (mode === 'exam') return examSubjectCards;
        return todayActivityCards;
    }, [activeTab, mode, learningPathCards, examSubjectCards, todayActivityCards]);

    const missionTasks = useMemo(() => {
        const sourceTasks = mode === 'exam' ? examTasks : tasks;
        const todayISO = new Date().toISOString().slice(0, 10);
        const todayPending = (sourceTasks || []).filter((task) => {
            if (!(task?.status === 'pending' || task?.status === 'in_progress')) return false;
            if (!task?.scheduled_for) return false;
            return String(task.scheduled_for).slice(0, 10) === todayISO;
        }).slice(0, 3);

        if (todayPending.length) return todayPending;
        return todayTask ? [todayTask] : [];
    }, [mode, examTasks, tasks, todayTask]);

    const todayMissionProgress = useMemo(() => {
        const todayISO = new Date().toISOString().slice(0, 10);
        const sourceTasks = mode === 'exam' ? examTasks : tasks;
        const todayAll = (sourceTasks || []).filter((task) => String(task?.scheduled_for || '').slice(0, 10) === todayISO);
        const completed = todayAll.filter((task) => task?.status === 'completed').length;
        const total = Math.max(todayAll.length, missionTasks.length || (todayTask ? 1 : 0));
        const percent = total ? Math.min(100, Math.round((completed / total) * 100)) : 0;

        return { completed, total, percent };
    }, [mode, examTasks, tasks, missionTasks.length, todayTask]);

    const weeklyHeatmap = useMemo(() => {
        const now = new Date();
        const days = [];

        for (let i = 6; i >= 0; i -= 1) {
            const date = new Date(now);
            date.setHours(0, 0, 0, 0);
            date.setDate(now.getDate() - i);
            const iso = date.toISOString().slice(0, 10);

            const count = allExecutionTasks.filter((task) => {
                if (task?.status !== 'completed') return false;
                const completedDate = String(task?.completed_at || task?.scheduled_for || '').slice(0, 10);
                return completedDate === iso;
            }).length;

            days.push({
                key: iso,
                label: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
                date: iso,
                count,
            });
        }

        return days;
    }, [allExecutionTasks]);

    const xpProgress = useMemo(() => {
        const current = XP_LEVELS.find((item) => xpPoints >= item.min && xpPoints <= item.max) || XP_LEVELS[0];
        const next = XP_LEVELS.find((item) => item.min > current.min) || null;
        const currentSpan = Math.max(1, current.max - current.min + 1);
        const inLevel = Math.max(0, xpPoints - current.min);

        return {
            current,
            next,
            percent: Math.min(100, Math.round((inLevel / currentSpan) * 100)),
            remaining: next ? Math.max(0, next.min - xpPoints) : 0,
        };
    }, [xpPoints]);

    const executionFeed = useMemo(() => {
        const feed = [];

        const recentCompletions = [...allExecutionTasks]
            .filter((task) => task?.status === 'completed')
            .sort((a, b) => new Date(b?.completed_at || b?.updated_at || b?.created_at) - new Date(a?.completed_at || a?.updated_at || a?.created_at))
            .slice(0, 4)
            .map((task) => ({
                id: `done-${task.id}`,
                icon: CheckCircle2,
                tone: 'text-emerald-600 dark:text-emerald-400',
                title: task.title,
                note: `Completed ${task.task_type === 'exam' ? 'exam mission' : 'learning mission'}`,
                meta: String(task?.completed_at || task?.updated_at || '').slice(0, 16).replace('T', ' '),
            }));

        feed.push(...recentCompletions);

        if (focusOpen) {
            feed.unshift({
                id: 'focus-now',
                icon: Timer,
                tone: 'text-blue-600 dark:text-blue-300',
                title: todayTask?.title || 'Deep work session',
                note: 'Focus session in progress',
                meta: 'Live now',
            });
        }

        if (currentStreak > 0) {
            feed.push({
                id: 'streak-event',
                icon: Flame,
                tone: 'text-orange-500',
                title: `${currentStreak} day streak active`,
                note: 'You kept consistency alive with daily execution.',
                meta: 'Streak update',
            });
        }

        if (!feed.length) {
            feed.push({
                id: 'starter-event',
                icon: Target,
                tone: 'text-slate-500 dark:text-slate-300',
                title: 'Start your first focus mission',
                note: 'Complete one mission to begin your execution timeline.',
                meta: 'No events yet',
            });
        }

        return feed.slice(0, 5);
    }, [allExecutionTasks, currentStreak, focusOpen, todayTask]);

    const progressItems = useMemo(() => {
        return [
            { label: 'Tasks', value: stats.tasks_completed || stats.completedTasks || 0 },
            { label: 'Focus', value: stats.focusSessions || 0 },
            { label: 'Today', value: stats.completedToday || 0 },
            { label: 'Weekly', value: progress?.weekly_completed || stats.weeklyCompleted || 0 },
            { label: 'Level', value: stats.level || 0 },
            { label: 'XP', value: stats.xp_points || stats.xp || 0 },
        ];
    }, [progress?.weekly_completed, stats.completedTasks, stats.completedToday, stats.focusSessions, stats.level, stats.tasks_completed, stats.weeklyCompleted, stats.xp, stats.xp_points]);

    const leagueModel = useMemo(() => {
        const apiLeague = progress?.league;

        if (apiLeague) {
            const tierStyle = LEAGUE_TIER_STYLES[apiLeague.tier] || LEAGUE_TIER_STYLES['Bronze League'];
            return {
                streak: stats.current_streak || stats.streak || 0,
                leaguePoints: apiLeague.league_points || 0,
                tierName: apiLeague.tier || 'Bronze League',
                tierStyle,
                progressPercent: apiLeague.progress_percent || 0,
                pointsToNextTier: apiLeague.points_to_next_tier || 0,
                nextTierName: apiLeague.next_tier || 'Max League',
                leaderboard: (apiLeague.leaderboard || []).map((entry) => ({
                    rank: entry.rank,
                    name: entry.name,
                    points: entry.league_points,
                    isMe: entry.is_me,
                })),
                myRank: apiLeague.rank || 1,
            };
        }

        const fallbackPoints = stats.xp_points || stats.xp || 0;
        const fallbackTier = LEAGUE_TIERS.find((item) => fallbackPoints >= item.min && fallbackPoints <= item.max) || LEAGUE_TIERS[0];
        const tierStyle = LEAGUE_TIER_STYLES[fallbackTier.name] || LEAGUE_TIER_STYLES['Bronze League'];

        return {
            streak: stats.current_streak || stats.streak || 0,
            leaguePoints: fallbackPoints,
            tierName: fallbackTier.name,
            tierStyle,
            progressPercent: 0,
            pointsToNextTier: 0,
            nextTierName: 'Max League',
            leaderboard: [],
            myRank: 1,
        };
    }, [progress?.league, stats.current_streak, stats.streak, stats.xp, stats.xp_points]);

    const ringRadius = 42;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference - (todayMissionProgress.percent / 100) * ringCircumference;

    return (
        <div className={`min-h-screen text-slate-800 transition-all duration-500 dark:text-slate-100 ${focusOpen ? 'bg-[radial-gradient(1200px_600px_at_25%_0%,#111827_0%,#090909_70%)] dark:bg-[radial-gradient(1200px_600px_at_25%_0%,#161616_0%,#060606_70%)]' : 'bg-[#F5F5F7] dark:bg-[#0b0b0b]'}`}>
            <div className="mx-auto max-w-[1480px] p-3 sm:p-5 lg:p-6">
                <motion.section
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${shellCardClass} mb-4 ${focusOpen ? 'border-slate-700 bg-[#131313] dark:bg-[#131313]' : ''}`}
                >
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.4fr_1fr] lg:items-stretch">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#161616]">
                            <div className="mb-3 flex items-center justify-between">
                                <DateTasksWidget tasks={[]} />
                                <ModeSwitch mode={mode} onChange={setMode} />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Planorah Execution</p>
                            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-800 dark:text-white sm:text-2xl">
                                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {displayName}
                            </h1>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Keep momentum. Stay consistent. Build your edge daily.</p>
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:border-orange-400/30 dark:bg-orange-500/10 dark:text-orange-300">
                                <Flame className="h-3.5 w-3.5" /> {currentStreak} day streak
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#151515]">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Today&apos;s Mission</p>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{todayMissionProgress.completed}/{todayMissionProgress.total} completed today</p>
                            <div className="mt-3 space-y-2">
                                {missionTasks.slice(0, 3).map((task, index) => (
                                    <div key={task.id || index} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-[#1a1a1a]">
                                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">{index + 1}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{task.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{task.estimated_time || '25 min'}</p>
                                        </div>
                                    </div>
                                ))}
                                {missionTasks.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
                                        No mission selected yet. Use AI coach to generate your first task.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 dark:border-white/10 dark:bg-[linear-gradient(150deg,#121212,#1a1a1a)]">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Current Task</p>
                                <p className="mt-1 text-base font-semibold text-slate-800 dark:text-white">{todayTask?.title || 'Create a focused mission'}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{todayTask?.estimated_time || 25} min • {(todayTask?.difficulty || 'medium').toUpperCase()}</p>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <button
                                    onClick={handleStartFocus}
                                    disabled={!todayTask || loading.bootstrap}
                                    className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                                >
                                    <Play className="h-4 w-4" />
                                    Start Focus
                                </button>
                                <button
                                    onClick={handleChangeTask}
                                    className={secondaryButtonClass}
                                >
                                    Change Task
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <section className="space-y-4 lg:col-span-8">
                        {focusOpen && (
                            <div className={`${shellCardClass} border-slate-700 bg-[#111111] dark:bg-[#111111]`}>
                                <FocusMode
                                    open={focusOpen}
                                    task={todayTask}
                                    onClose={() => setFocusOpen(false)}
                                    onComplete={handleFocusComplete}
                                    embedded
                                />
                            </div>
                        )}

                        {rewardPulse && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/10"
                            >
                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">Mission complete</p>
                                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">+{rewardPulse.xp} XP • {rewardPulse.streak} day streak • Level {rewardPulse.level}</p>
                            </motion.div>
                        )}

                        <div className={shellCardClass}>
                            <div className="mb-4 flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Execution Feed</p>
                                    <h3 className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">Live learning timeline</h3>
                                </div>
                                <button
                                    onClick={() => setVoicePanelOpen(true)}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                                >
                                    Open AI Voice
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                {executionFeed.map((item) => (
                                    <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-[#161616]">
                                        <div className="flex items-start gap-3">
                                            <span className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-[#202020] ${item.tone}`}>
                                                <item.icon className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{item.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.note}</p>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{item.meta}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!focusOpen && (
                            <div className={shellCardClass}>
                                <div className="mb-4 flex items-center gap-5 border-b border-slate-200 pb-2 dark:border-white/10">
                                    <button
                                        onClick={() => setActiveTab('activities')}
                                        className={`pb-2 text-sm font-semibold transition ${activeTab === 'activities' ? 'border-b-2 border-blue-600 text-blue-700 dark:text-white dark:border-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                    >
                                        Activities
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('paths')}
                                        className={`pb-2 text-sm font-semibold transition ${activeTab === 'paths' ? 'border-b-2 border-blue-600 text-blue-700 dark:text-white dark:border-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                    >
                                        Paths
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {activeCards.map((card) => (
                                        <article key={card.key} className="rounded-3xl border border-slate-200 bg-[#fbfdff] p-4 dark:border-white/10 dark:bg-[#151515]">
                                            <div className="mb-3 flex items-center gap-2">
                                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-white/10 dark:text-white">{card.tag}</span>
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">{card.type}</span>
                                            </div>
                                            <h3 className="text-[21px] font-semibold leading-7 text-slate-800 dark:text-slate-100">{card.title}</h3>
                                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-300">{card.subtitle}</p>
                                            <Link to={card.ctaTo} className="ml-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 transition hover:bg-sky-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </article>
                                    ))}
                                </div>

                                {activeTab === 'activities' && mode !== 'exam' && todayActivityCards.length === 0 && (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-[#151515] dark:text-slate-300">
                                        No pending tasks scheduled for today. Add or schedule tasks from the task manager.
                                    </div>
                                )}

                                {activeTab === 'activities' && mode === 'exam' && subjectsLoading && (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-[#151515] dark:text-slate-400">
                                        Loading exam subjects...
                                    </div>
                                )}

                                {activeTab === 'activities' && mode === 'exam' && !subjectsLoading && examSubjectCards.length === 0 && (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-[#151515] dark:text-slate-300">
                                        No exam subjects found. Create subjects in Study Platform to open topics and begin preparation.
                                    </div>
                                )}

                                {activeTab === 'paths' && !roadmapsLoading && learningPathCards.length === 0 && (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-[#151515] dark:text-slate-300">
                                        No learning paths created yet. Create your first path in the roadmap generator.
                                    </div>
                                )}

                                {activeTab === 'paths' && roadmapsLoading && (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-[#151515] dark:text-slate-400">
                                        Loading your learning paths...
                                    </div>
                                )}
                            </div>
                        )}

                        {mode === 'exam' && (
                            <div className={shellCardClass}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-400">Exam Mode</p>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                            {activeExamPlan ? 'Your exam plan is active and ready to use.' : 'Generate a structured exam plan from your syllabus.'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={createExamPlan}
                                        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                    >
                                        {loading.examPlan ? 'Generating...' : activeExamPlan ? 'Regenerate Plan' : 'Generate Plan'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    <aside className="space-y-4 lg:col-span-4">
                        <div className={shellCardClass}>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Today Progress</p>
                            <div className="mt-3 flex items-center gap-4">
                                <div className="relative h-28 w-28">
                                    <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
                                        <circle cx="50" cy="50" r={ringRadius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-white/10" />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r={ringRadius}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={ringCircumference}
                                            strokeDashoffset={ringOffset}
                                            className="text-blue-600 dark:text-slate-100"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-xl font-bold text-slate-800 dark:text-white">{todayMissionProgress.percent}%</p>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400">today</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{todayMissionProgress.completed}/{todayMissionProgress.total} missions done</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Weekly completion: {progress?.weekly_completed || 0} tasks</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Next level in {xpProgress.remaining} XP</p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-[#161616]">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Weekly Heatmap</p>
                                <div className="grid grid-cols-7 gap-1.5">
                                    {weeklyHeatmap.map((day) => (
                                        <div key={day.key} className="text-center">
                                            <div className={`h-8 rounded-md ${day.count >= 3 ? 'bg-emerald-500/90' : day.count === 2 ? 'bg-emerald-400/70' : day.count === 1 ? 'bg-emerald-300/50' : 'bg-slate-200 dark:bg-white/10'}`} title={`${day.date}: ${day.count} tasks`} />
                                            <p className="mt-1 text-[10px] text-slate-400">{day.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-[#161616]">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-slate-700 dark:text-slate-100">XP Progress</span>
                                    <span className="text-slate-500 dark:text-slate-400">{xpPoints} XP</span>
                                </div>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-slate-100 dark:to-slate-400" style={{ width: `${xpProgress.percent}%` }} />
                                </div>
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{xpProgress.current.level}{xpProgress.next ? ` -> ${xpProgress.next.level}` : ' • Max level reached'}</p>
                            </div>
                        </div>

                        <div className={shellCardClass}>
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">AI Smart Suggestion</p>
                                    <h3 className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">What should you do next?</h3>
                                </div>
                                <BrainCircuit className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                {coach?.reason || todayTask?.reason || 'Pick one high-impact mission and protect a 25-minute deep focus block right now.'}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button onClick={handleChangeTask} className={secondaryButtonClass}>Refine Suggestion</button>
                                <button onClick={() => setVoicePanelOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black dark:bg-white dark:text-black">
                                    <Sparkles className="h-3.5 w-3.5" /> Ask AI Coach
                                </button>
                            </div>
                        </div>

                        {!focusOpen && (
                            <>
                                <ProfileCard
                                    user={profile}
                                    streak={progress?.streak || null}
                                    currentStreakValue={currentStreak}
                                    summaryItems={progressItems}
                                />

                                <div className={shellCardClass}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-400">League</p>
                                            <h3 className={`mt-1 text-2xl font-semibold ${leagueModel.tierStyle.accent}`}>{leagueModel.tierName}</h3>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${leagueModel.tierStyle.chip}`}>
                                            Rank #{leagueModel.myRank}
                                        </span>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-[#151515]">
                                        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                                            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" /> {leagueModel.leaguePoints} pts</span>
                                            <span className="inline-flex items-center gap-1.5"><Flame className="h-4 w-4 text-orange-500" /> {leagueModel.streak} streak</span>
                                        </div>

                                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                                            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" style={{ width: `${leagueModel.progressPercent}%` }} />
                                        </div>

                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                            {leagueModel.pointsToNextTier > 0
                                                ? `${leagueModel.pointsToNextTier} points to ${leagueModel.nextTierName}`
                                                : 'You are in the highest league tier'}
                                        </p>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        {leagueModel.leaderboard.map((entry, index) => (
                                            <div
                                                key={`${entry.rank}-${entry.name}-${index}`}
                                                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${entry.isMe
                                                    ? 'border-blue-200 bg-blue-50 dark:border-white/20 dark:bg-white/10'
                                                    : 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#151515]'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 text-xs font-semibold text-slate-500 dark:text-slate-400">{entry.rank || index + 1}</span>
                                                    {index === 0 ? <Crown className="h-4 w-4 text-amber-500" /> : <Medal className="h-4 w-4 text-slate-400" />}
                                                    <span className={`font-medium ${entry.isMe ? 'text-blue-700 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{entry.name}</span>
                                                </div>
                                                <span className="font-semibold text-slate-700 dark:text-slate-100">{entry.points}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {leagueModel.leaderboard.length === 0 && (
                                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Leaderboard will appear when more real users have execution stats.</p>
                                    )}

                                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                                        Points formula: task completions + streak growth. Completing tasks increases league points automatically.
                                    </p>
                                </div>

                                <CalendarWidget />
                            </>
                        )}
                    </aside>
                </div>
            </div>

            <AIVoicePanel
                isOpen={voicePanelOpen}
                onClose={() => setVoicePanelOpen(false)}
                contextSource="dashboard"
            />
        </div>
    );
};

export default ExecutionDashboard;
