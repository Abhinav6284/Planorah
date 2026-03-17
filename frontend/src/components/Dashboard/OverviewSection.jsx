import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { schedulerService } from "../../api/schedulerService";
import { userService } from "../../api/userService";
import { FaBolt, FaBrain, FaPause, FaPlay, FaRedo, FaStepForward, FaTrophy } from "react-icons/fa";

import AIVoicePanel from "../Mentoring/AIVoicePanel";
import StreakUpdateModal from "./Modals/StreakUpdateModal";
import ProfileCard from "./NewWidgets/ProfileCard";
import DateTasksWidget from "./NewWidgets/DateTasksWidget";
import OnboardingWidget from "./NewWidgets/OnboardingWidget";
import TaskSchedulerWidget from "./NewWidgets/TaskSchedulerWidget";
import ProgressChartWidget from "./NewWidgets/ProgressChartWidget";
import QuickStatsWidget from "./NewWidgets/QuickStatsWidget";
import CodeSpaceWidget from "./NewWidgets/CodeSpaceWidget";
import ResearchWidget from "./NewWidgets/ResearchWidget";
import PortfolioWidget from "./NewWidgets/PortfolioWidget";
import CalendarWidget from "./NewWidgets/CalendarWidget";

const ElevenLabsVoiceButton = ({ onClick }) => {
    return (
        <motion.div
            layout
            onClick={onClick}
            className="group flex h-[44px] cursor-pointer items-center gap-2.5 rounded-[24px] border border-slate-200/80 bg-white/80 px-[10px] shadow-[0_8px_20px_-12px_rgba(15,23,42,0.35)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/80 hover:bg-cyan-50/80 dark:border-white/10 dark:bg-slate-900/75 dark:hover:border-cyan-400/30 dark:hover:bg-slate-800/85"
        >
            <motion.div layout className="relative h-[26px] w-[26px] shrink-0 overflow-hidden rounded-full shadow-[0_2px_10px_rgba(14,116,144,0.35)]">
                <div className="absolute inset-0 bg-[#0ea5e9]" />
                <div className="absolute inset-0 animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(34,211,238,0.85)_110deg,rgba(125,211,252,0.95)_190deg,transparent_250deg)]" />
                <div className="absolute inset-[1px] rounded-full border-[0.5px] border-white/25 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.72)_0%,transparent_52%,rgba(0,0,0,0.18)_100%)] mix-blend-overlay" />
            </motion.div>

            <motion.div layout className="flex items-center overflow-hidden pr-1">
                <motion.span className="whitespace-nowrap text-[14px] font-semibold text-slate-700 transition-colors group-hover:text-cyan-700 dark:text-slate-200 dark:group-hover:text-cyan-300">
                    Voice coach
                </motion.span>
            </motion.div>
        </motion.div>
    );
};

const DEFAULT_FOCUS_SECONDS = 25 * 60;

const getTaskFocusSeconds = (task) => {
    const minutes = Number(task?.estimated_minutes);
    if (Number.isFinite(minutes) && minutes > 0) {
        return Math.round(minutes * 60);
    }
    return DEFAULT_FOCUS_SECONDS;
};

const formatFocusTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const mins = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
    const secs = (safeSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
};

const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good morning";
    if (currentHour < 17) return "Good afternoon";
    return "Good evening";
};

const getDisplayName = (profile) => {
    if (!profile) return "there";
    if (profile.first_name) return profile.first_name;
    if (profile.username) return profile.username.split(/(?=[A-Z])/)[0];
    return "there";
};

const formatMinutes = (minutes) => {
    if (!Number.isFinite(minutes) || minutes <= 0) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export default function OverviewSection() {
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [streakData, setStreakData] = useState(null);
    const [voicePanelOpen, setVoicePanelOpen] = useState(false);
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [focusActive, setFocusActive] = useState(false);
    const [focusSecondsLeft, setFocusSecondsLeft] = useState(DEFAULT_FOCUS_SECONDS);
    const [focusTaskIndex, setFocusTaskIndex] = useState(0);
    const hasFetchedRef = useRef(false);

    const pendingTasks = useMemo(
        () => tasks.filter((task) => task.status !== "completed"),
        [tasks]
    );

    const completedTasks = useMemo(
        () => tasks.filter((task) => task.status === "completed").length,
        [tasks]
    );

    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const activeFocusTask =
        pendingTasks.length > 0
            ? pendingTasks[Math.min(focusTaskIndex, pendingTasks.length - 1)]
            : null;

    const focusDurationSeconds = getTaskFocusSeconds(activeFocusTask);

    const totalPendingMinutes = useMemo(
        () =>
            pendingTasks.reduce((sum, task) => {
                const taskMinutes = Number(task?.estimated_minutes);
                return sum + (Number.isFinite(taskMinutes) && taskMinutes > 0 ? taskMinutes : 25);
            }, 0),
        [pendingTasks]
    );

    const activePaths = useMemo(
        () => new Set(tasks.map((task) => task.roadmap_title).filter(Boolean)).size,
        [tasks]
    );

    const streakCurrent = streakData?.streak?.current || 0;
    const streakLongest = streakData?.streak?.longest || 0;
    const nextStreakMilestone = Math.max(7, Math.ceil((streakCurrent + 1) / 7) * 7);
    const streakWindowProgress = streakCurrent === 0
        ? 0
        : Math.min(100, Math.round(((streakCurrent % 7 || 7) / 7) * 100));

    const focusProgress = focusDurationSeconds > 0
        ? Math.min(1, Math.max(0, (focusDurationSeconds - focusSecondsLeft) / focusDurationSeconds))
        : 0;
    const focusProgressAngle = Math.round(focusProgress * 360);
    const focusProgressPct = Math.round(focusProgress * 100);

    const heroHighlights = [
        {
            icon: <FaBolt className="text-cyan-600 dark:text-cyan-300" size={12} />,
            label: "Focus workload",
            value: formatMinutes(totalPendingMinutes)
        },
        {
            icon: <FaTrophy className="text-amber-500 dark:text-amber-300" size={12} />,
            label: "Best streak",
            value: `${streakLongest} day${streakLongest === 1 ? "" : "s"}`
        },
        {
            icon: <FaBrain className="text-sky-600 dark:text-sky-300" size={12} />,
            label: "Active paths",
            value: `${activePaths}`
        }
    ];

    useEffect(() => {
        if (pendingTasks.length === 0) {
            setFocusTaskIndex(0);
            return;
        }
        if (focusTaskIndex >= pendingTasks.length) {
            setFocusTaskIndex(0);
        }
    }, [pendingTasks.length, focusTaskIndex]);

    useEffect(() => {
        setFocusActive(false);
        setFocusSecondsLeft(focusDurationSeconds);
    }, [focusDurationSeconds, activeFocusTask?.id]);

    useEffect(() => {
        let interval;
        if (focusActive && focusSecondsLeft > 0) {
            interval = setInterval(() => {
                setFocusSecondsLeft((prev) => Math.max(prev - 1, 0));
            }, 1000);
        } else if (focusActive && focusSecondsLeft === 0) {
            setFocusActive(false);
        }
        return () => clearInterval(interval);
    }, [focusActive, focusSecondsLeft]);

    const toggleFocus = () => setFocusActive((prev) => !prev);

    const resetFocus = () => {
        setFocusActive(false);
        setFocusSecondsLeft(focusDurationSeconds);
    };

    const nextFocusTask = () => {
        if (pendingTasks.length <= 1) return;
        setFocusTaskIndex((prev) => (prev + 1) % pendingTasks.length);
    };

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        const fetchData = async () => {
            try {
                await userService.dailyLogin().catch(() => null);

                const [statsData, tasksData, profileData, detailedStats] = await Promise.all([
                    schedulerService.getDashboardStats(),
                    schedulerService.getTasks(),
                    userService.getProfile().catch(() => null),
                    userService.getStatistics().catch(() => null)
                ]);

                const profile = {
                    ...statsData?.profile,
                    first_name: profileData?.first_name,
                    last_name: profileData?.last_name,
                    username: profileData?.username,
                    gender: profileData?.profile?.gender || statsData?.profile?.gender || '',
                    field_of_study: profileData?.profile?.field_of_study || profileData?.field_of_study || "",
                    xp: profileData?.xp_points || 0
                };

                setUserProfile(profile);
                setTasks(tasksData || []);
                setStreakData(detailedStats);

                const currentStreak = detailedStats?.streak?.current || 0;
                if (currentStreak > 0) {
                    const lastSeen = localStorage.getItem("streakAnimationDate");
                    const today = new Date().toDateString();
                    if (lastSeen !== today) {
                        setShowStreakModal(true);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#020617]">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                    <div className="text-lg text-slate-500 dark:text-slate-400">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50 transition-colors duration-300 dark:bg-[#020617]">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl dark:bg-cyan-500/15" />
            <div className="pointer-events-none absolute -right-28 top-24 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-500/20" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-400/10" />

            <div className="relative z-10 mx-auto max-w-[1680px] px-3 pb-8 pt-4 sm:px-4 lg:px-7 lg:pt-6">
                <motion.section
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12"
                >
                    <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_26px_80px_-45px_rgba(14,116,144,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 sm:p-6 xl:col-span-8">
                        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/20" />
                        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 bg-gradient-to-tl from-blue-300/25 to-transparent dark:from-blue-500/20" />

                        <div className="relative">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200">
                                    Student Command Center
                                </span>
                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
                                <div className="xl:col-span-3">
                                    <DateTasksWidget tasks={tasks} />

                                    <h1 className="mt-4 text-2xl leading-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white [font-family:'Space_Grotesk',sans-serif]">
                                        {getGreeting()}, <span className="text-cyan-700 dark:text-cyan-300">{getDisplayName(userProfile)}</span>
                                    </h1>

                                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        Keep momentum high with AI planning, focused execution blocks, and streak-driven progress. Your dashboard now prioritizes the one thing that moves today forward.
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {heroHighlights.map((highlight) => (
                                            <div
                                                key={highlight.label}
                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/75 px-3 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-slate-950/45"
                                            >
                                                {highlight.icon}
                                                <span className="font-semibold text-slate-800 dark:text-slate-100">{highlight.value}</span>
                                                <span className="text-slate-500 dark:text-slate-400">{highlight.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <Link
                                            to="/assistant"
                                            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                        >
                                            Talk to AI Coach
                                        </Link>
                                        <Link
                                            to="/tasks/focus"
                                            className="inline-flex items-center rounded-xl border border-slate-300 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-cyan-300 hover:text-cyan-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-cyan-400/40 dark:hover:text-cyan-200"
                                        >
                                            Open Focus Mode
                                        </Link>
                                    </div>
                                </div>

                                <div className="space-y-3 xl:col-span-2">
                                    <div className="rounded-2xl border border-slate-200/90 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/45">
                                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Today&apos;s completion</p>
                                        <div className="mt-2 flex items-end justify-between">
                                            <p className="text-3xl font-semibold text-slate-900 dark:text-white">{completionRate}%</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{completedTasks} / {totalTasks} tasks</p>
                                        </div>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
                                                style={{ width: `${completionRate}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200/90 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/45">
                                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Streak milestone</p>
                                        <div className="mt-2 flex items-center justify-between gap-3">
                                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                                {streakCurrent} day{streakCurrent === 1 ? "" : "s"}
                                            </p>
                                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                                                best {streakLongest}
                                            </span>
                                        </div>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                                                style={{ width: `${streakWindowProgress}%` }}
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                            {Math.max(nextStreakMilestone - streakCurrent, 0)} days to your {nextStreakMilestone}-day badge
                                        </p>
                                    </div>

                                    <QuickStatsWidget tasks={tasks} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[34px] border border-slate-200/80 bg-white/82 p-5 shadow-[0_24px_80px_-48px_rgba(2,132,199,0.6)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 sm:p-6 xl:col-span-4">
                        <div className="pointer-events-none absolute -top-20 right-0 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/20" />

                        <div className="relative flex h-full flex-col">
                            <div className="mb-5 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Focus Command Center</p>
                                    <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white [font-family:'Space_Grotesk',sans-serif]">
                                        Deep Work Timer
                                    </h2>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${focusActive
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300"
                                    : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                                    }`}>
                                    {focusActive ? "In session" : "Ready"}
                                </span>
                            </div>

                            <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/75 p-3 dark:border-white/10 dark:bg-slate-950/45">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Current task</p>
                                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                    {activeFocusTask?.title || "No pending task selected. Schedule one to start a session."}
                                </p>
                            </div>

                            <div
                                className="mx-auto mb-4 grid h-40 w-40 place-items-center rounded-full p-2"
                                style={{
                                    background: `conic-gradient(${focusActive ? "#14b8a6" : "#0ea5e9"} ${focusProgressAngle}deg, rgba(148,163,184,0.22) 0deg)`
                                }}
                            >
                                <div className="grid h-full w-full place-items-center rounded-full border border-slate-200 bg-white/95 dark:border-white/10 dark:bg-[#0b1220]">
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">{focusProgressPct}% complete</p>
                                    <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{formatFocusTime(focusSecondsLeft)}</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{Math.round(focusDurationSeconds / 60)} min block</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={toggleFocus}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition-all hover:-translate-y-0.5 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                    title={focusActive ? "Pause timer" : "Start timer"}
                                >
                                    {focusActive ? <FaPause size={12} /> : <FaPlay size={12} className="ml-0.5" />}
                                </button>
                                <button
                                    onClick={resetFocus}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white/70 text-slate-600 transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-cyan-200"
                                    title="Reset timer"
                                >
                                    <FaRedo size={12} />
                                </button>
                                {pendingTasks.length > 1 && (
                                    <button
                                        onClick={nextFocusTask}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white/70 text-slate-600 transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-cyan-200"
                                        title="Next task timer"
                                    >
                                        <FaStepForward size={11} />
                                    </button>
                                )}
                            </div>

                            <div className="mt-4">
                                <ElevenLabsVoiceButton onClick={() => setVoicePanelOpen(true)} />
                            </div>

                            <div className="mt-3 rounded-2xl border border-cyan-200/80 bg-cyan-50/80 p-3 text-xs text-cyan-900 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-100">
                                <span className="font-semibold">Pro tip:</span> Pair one focused timer block with AI voice check-ins for better retention and consistency.
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-4 lg:grid-cols-12"
                >
                    <div className="flex flex-col gap-4 lg:col-span-8">
                        <motion.div
                            variants={itemVariants}
                            className="rounded-[30px] bg-gradient-to-br from-white/95 to-cyan-100/55 p-[1px] shadow-[0_20px_60px_-42px_rgba(2,132,199,0.6)] dark:from-slate-700/60 dark:to-slate-900/90"
                        >
                            <div className="overflow-hidden rounded-[29px]">
                                <TaskSchedulerWidget tasks={tasks} />
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <motion.div
                                variants={itemVariants}
                                className="min-h-[240px] rounded-[30px] bg-gradient-to-br from-white/95 to-blue-100/50 p-[1px] shadow-[0_20px_55px_-42px_rgba(59,130,246,0.55)] dark:from-slate-700/60 dark:to-slate-900/90"
                            >
                                <div className="h-full overflow-hidden rounded-[29px]">
                                    {(userProfile?.field_of_study?.toLowerCase().includes("computer") ||
                                        userProfile?.field_of_study?.toLowerCase().includes("it")) ? (
                                        <CodeSpaceWidget />
                                    ) : (userProfile?.field_of_study?.toLowerCase().includes("medical") ||
                                        userProfile?.field_of_study?.toLowerCase().includes("life") ||
                                        userProfile?.field_of_study?.toLowerCase().includes("science") ||
                                        userProfile?.field_of_study?.toLowerCase().includes("doctor")) ? (
                                        <ResearchWidget userField={userProfile?.field_of_study} />
                                    ) : (
                                        <PortfolioWidget />
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="min-h-[240px] rounded-[30px] bg-gradient-to-br from-white/95 to-sky-100/45 p-[1px] shadow-[0_20px_55px_-42px_rgba(14,116,144,0.58)] dark:from-slate-700/60 dark:to-slate-900/90"
                            >
                                <div className="h-full overflow-hidden rounded-[29px]">
                                    <CalendarWidget />
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            variants={itemVariants}
                            className="rounded-[30px] bg-gradient-to-br from-white/95 to-cyan-100/45 p-[1px] shadow-[0_20px_60px_-42px_rgba(8,145,178,0.58)] dark:from-slate-700/60 dark:to-slate-900/90"
                        >
                            <div className="overflow-hidden rounded-[29px]">
                                <ProgressChartWidget data={tasks} />
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex flex-col gap-4 lg:col-span-4">
                        <motion.div variants={itemVariants}>
                            <ProfileCard user={userProfile} streak={streakData} />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <OnboardingWidget />
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {showStreakModal && (
                <StreakUpdateModal
                    streak={streakData?.streak?.current || 0}
                    onClose={() => {
                        localStorage.setItem("streakAnimationDate", new Date().toDateString());
                        setShowStreakModal(false);
                    }}
                />
            )}

            <AIVoicePanel
                isOpen={voicePanelOpen}
                onClose={() => setVoicePanelOpen(false)}
                contextSource="dashboard"
            />
        </div>
    );
}
