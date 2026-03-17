import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { schedulerService } from "../../api/schedulerService";
import { userService } from "../../api/userService";
import { FaArrowRight, FaBolt, FaBrain, FaPause, FaPlay, FaRedo, FaStepForward } from "react-icons/fa";

import AIVoicePanel from "../Mentoring/AIVoicePanel";
import StreakUpdateModal from "./Modals/StreakUpdateModal";
import TaskSchedulerWidget from "./NewWidgets/TaskSchedulerWidget";
import ProgressChartWidget from "./NewWidgets/ProgressChartWidget";

const SURFACE_CARD = "group relative overflow-hidden rounded-[20px] border border-white/45 bg-white/58 shadow-[0_18px_44px_-30px_rgba(37,99,235,0.42)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/62 hover:shadow-[0_24px_52px_-32px_rgba(59,130,246,0.5)] dark:border-white/15 dark:bg-white/[0.06] dark:hover:bg-white/[0.09]";
const INNER_CARD = "relative overflow-hidden rounded-2xl border border-white/50 bg-white/55 p-4 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.05]";

const PRIMARY_BUTTON = "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-12px_rgba(37,99,235,0.72)] transition-all duration-200 hover:brightness-105";
const SECONDARY_BUTTON = "inline-flex items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur-xl transition-all duration-200 hover:border-blue-300 hover:text-blue-700 dark:border-white/15 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:border-blue-400/50 dark:hover:text-blue-200";

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

const VoiceCoachButton = ({ onClick }) => {
    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/55 bg-white/60 px-3 py-2 text-sm font-semibold text-blue-700 backdrop-blur-xl transition-all duration-200 hover:border-blue-300 hover:bg-white/70 dark:border-white/15 dark:bg-white/[0.05] dark:text-blue-200"
        >
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-400" />
            Voice Coach
        </motion.button>
    );
};

export default function OverviewSection() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [streakData, setStreakData] = useState(null);
    const [insight, setInsight] = useState(null);
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
    const pendingCount = pendingTasks.length;
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

    const streakCurrent = streakData?.streak?.current || 0;
    const streakLongest = streakData?.streak?.longest || 0;
    const nextStreakMilestone = Math.max(7, Math.ceil((streakCurrent + 1) / 7) * 7);
    const streakProgress = nextStreakMilestone > 0
        ? Math.min(100, Math.round((streakCurrent / nextStreakMilestone) * 100))
        : 0;

    const focusProgress = focusDurationSeconds > 0
        ? Math.min(1, Math.max(0, (focusDurationSeconds - focusSecondsLeft) / focusDurationSeconds))
        : 0;
    const focusProgressAngle = Math.round(focusProgress * 360);
    const focusProgressPct = Math.round(focusProgress * 100);

    const focusPrompt = activeFocusTask
        ? `Help me complete this focus block: "${activeFocusTask.title}". Give me a 25-minute execution plan, likely blockers, and one success checkpoint.`
        : `Help me pick the best next deep-work task based on my dashboard context and create a focused 25-minute plan.`;

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

                const [statsData, tasksData, profileData, detailedStats, onboardingInsight] = await Promise.all([
                    schedulerService.getDashboardStats(),
                    schedulerService.getTasks(),
                    userService.getProfile().catch(() => null),
                    userService.getStatistics().catch(() => null),
                    schedulerService.getOnboardingInsights().catch(() => null)
                ]);

                const profile = {
                    ...statsData?.profile,
                    first_name: profileData?.first_name,
                    last_name: profileData?.last_name,
                    username: profileData?.username,
                    gender: profileData?.profile?.gender || statsData?.profile?.gender || "",
                    field_of_study: profileData?.profile?.field_of_study || profileData?.field_of_study || "",
                    xp: profileData?.xp_points || 0
                };

                setUserProfile(profile);
                setTasks(tasksData || []);
                setStreakData(detailedStats);
                setInsight(onboardingInsight);

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
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0b1220]">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <div className="text-base text-slate-500 dark:text-slate-400">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#eef2ff] dark:bg-[#090f1f]">
            <motion.div
                className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-sky-300/32 blur-3xl dark:bg-sky-500/18"
                animate={{ x: [0, 10, 0], y: [0, 8, 0] }}
                transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="pointer-events-none absolute -right-20 top-14 h-[360px] w-[360px] rounded-full bg-blue-300/28 blur-3xl dark:bg-blue-500/16"
                animate={{ x: [0, -10, 0], y: [0, 8, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="pointer-events-none absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-500/10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 mx-auto max-w-[1480px] px-4 py-5 lg:py-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-5 lg:grid-cols-12"
                >
                    <motion.section variants={itemVariants} whileHover={{ y: -2 }} className={`${SURFACE_CARD} p-6 lg:col-span-8`}>
                        <motion.div
                            className="pointer-events-none absolute inset-0 opacity-45"
                            style={{
                                backgroundImage: "linear-gradient(125deg, rgba(56,189,248,0.16), rgba(59,130,246,0.12), rgba(125,211,252,0.12))",
                                backgroundSize: "200% 200%"
                            }}
                            animate={{ backgroundPosition: ["45% 50%", "55% 50%", "45% 50%"] }}
                            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
                        />

                        <div className="relative z-10">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                <span className="inline-flex items-center rounded-full border border-white/60 bg-white/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700 backdrop-blur-lg dark:border-white/20 dark:bg-white/[0.06] dark:text-blue-200">
                                    Focus Primary
                                </span>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                                </span>
                            </div>

                            <h1 className="text-2xl leading-tight text-slate-900 sm:text-3xl dark:text-white [font-family:'Space_Grotesk',sans-serif]">
                                {getGreeting()}, {getDisplayName(userProfile)}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                                Start with one clear deep-work block, then move into scheduling and progress review.
                            </p>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className={`${INNER_CARD} min-w-0`}>
                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Focus timer</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{Math.round(focusDurationSeconds / 60)} min block</p>
                                    </div>

                                    <div className="relative mx-auto mb-4 grid h-44 w-44 place-items-center">
                                        <motion.div
                                            className="absolute inset-4 rounded-full bg-blue-500/26 blur-2xl"
                                            animate={focusActive ? { opacity: [0.2, 0.34, 0.2], scale: [0.99, 1.02, 0.99] } : { opacity: 0.16, scale: 1 }}
                                            transition={focusActive ? { duration: 2.2, repeat: Infinity } : { duration: 0.3 }}
                                        />

                                        <div
                                            className="relative grid h-full w-full place-items-center rounded-full p-2"
                                            style={{
                                                background: `conic-gradient(#2563eb ${focusProgressAngle}deg, rgba(148,163,184,0.24) 0deg)`
                                            }}
                                        >
                                            <div className="grid h-full w-full place-items-center rounded-full border border-white/60 bg-white/70 backdrop-blur-xl dark:border-white/20 dark:bg-white/[0.06]">
                                                <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{focusProgressPct}% complete</p>
                                                <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{formatFocusTime(focusSecondsLeft)}</p>
                                                <p className={`text-[11px] font-semibold ${focusActive ? "text-blue-600 dark:text-blue-300" : "text-slate-500 dark:text-slate-400"}`}>
                                                    {focusActive ? "In session" : "Ready"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex items-center justify-center gap-2">
                                        <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={toggleFocus} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white shadow-[0_10px_20px_-12px_rgba(37,99,235,0.72)]">
                                            {focusActive ? <FaPause size={12} /> : <FaPlay size={12} className="ml-0.5" />}
                                        </motion.button>
                                        <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={resetFocus} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/60 text-slate-600 backdrop-blur-xl dark:border-white/20 dark:bg-white/[0.06] dark:text-slate-300">
                                            <FaRedo size={12} />
                                        </motion.button>
                                        {pendingTasks.length > 1 && (
                                            <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={nextFocusTask} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/60 text-slate-600 backdrop-blur-xl dark:border-white/20 dark:bg-white/[0.06] dark:text-slate-300">
                                                <FaStepForward size={11} />
                                            </motion.button>
                                        )}
                                    </div>

                                    <div className="rounded-xl border border-white/60 bg-white/50 px-3 py-2 backdrop-blur-xl dark:border-white/20 dark:bg-white/[0.04]">
                                        <p className="text-[11px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Selected task</p>
                                        <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                            {activeFocusTask?.title || "Pick a task from Schedule below"}
                                        </p>
                                    </div>
                                </div>

                                <div className={`${INNER_CARD} flex min-h-full flex-col`}>
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">AI coach</p>
                                        <motion.span
                                            className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-400"
                                            animate={{ opacity: [0.52, 0.82, 0.52] }}
                                            transition={{ duration: 2.2, repeat: Infinity }}
                                        />
                                    </div>

                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {insight?.today_action || "Ask AI to break down your next focus session into clear steps."}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        {insight?.summary || "Keep actions short, measurable, and tied to one immediate outcome."}
                                    </p>

                                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                        <div className="rounded-xl border border-white/60 bg-white/50 px-3 py-2 backdrop-blur-xl dark:border-white/20 dark:bg-white/[0.04]">
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                <FaBolt size={11} className="text-blue-500" />
                                                Focus Load
                                            </div>
                                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{formatMinutes(totalPendingMinutes)}</p>
                                        </div>
                                        <div className="rounded-xl border border-white/60 bg-white/50 px-3 py-2 backdrop-blur-xl dark:border-white/20 dark:bg-white/[0.04]">
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                <FaBrain size={11} className="text-blue-500" />
                                                Next Milestone
                                            </div>
                                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{Math.max(nextStreakMilestone - streakCurrent, 0)} days</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <motion.button
                                            type="button"
                                            whileTap={{ scale: 0.96 }}
                                            onClick={() => navigate("/assistant", { state: { initialMessage: focusPrompt } })}
                                            className={PRIMARY_BUTTON}
                                        >
                                            Ask AI Coach
                                            <FaArrowRight size={12} />
                                        </motion.button>
                                        <VoiceCoachButton onClick={() => setVoicePanelOpen(true)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    <div className="flex flex-col gap-5 lg:col-span-4">
                        <motion.div variants={itemVariants} whileHover={{ y: -2 }} className={`${SURFACE_CARD} p-5`}>
                            <motion.div
                                className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-orange-400/30 blur-3xl"
                                animate={{ opacity: [0.2, 0.3, 0.2], scale: [0.98, 1.03, 0.98] }}
                                transition={{ duration: 3.2, repeat: Infinity }}
                            />

                            <div className="relative z-10">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Momentum</p>
                                    <motion.div
                                        className="text-2xl"
                                        animate={streakCurrent > 0 ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                                        transition={streakCurrent > 0 ? { duration: 2.6, repeat: Infinity } : { duration: 0.2 }}
                                    >
                                        🔥
                                    </motion.div>
                                </div>

                                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{streakCurrent} day streak</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Best: {streakLongest} days</p>

                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/60 dark:bg-white/10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${streakProgress}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    {Math.max(nextStreakMilestone - streakCurrent, 0)} days to {nextStreakMilestone}-day milestone
                                </p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} whileHover={{ y: -2 }} className={`${SURFACE_CARD} p-5`}>
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Today snapshot</p>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                <div className="rounded-xl border border-white/60 bg-white/50 px-3 py-3 text-center backdrop-blur-xl dark:border-white/20 dark:bg-white/[0.04]">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Total</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{totalTasks}</p>
                                </div>
                                <div className="rounded-xl border border-white/60 bg-white/50 px-3 py-3 text-center backdrop-blur-xl dark:border-white/20 dark:bg-white/[0.04]">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Done</p>
                                    <p className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-300">{completedTasks}</p>
                                </div>
                                <div className="rounded-xl border border-white/60 bg-white/50 px-3 py-3 text-center backdrop-blur-xl dark:border-white/20 dark:bg-white/[0.04]">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Pending</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{pendingCount}</p>
                                </div>
                            </div>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/60 dark:bg-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionRate}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500"
                                />
                            </div>

                            <div className="mt-4 flex gap-2">
                                <motion.div whileTap={{ scale: 0.96 }}>
                                    <Link to="/tasks" className={SECONDARY_BUTTON}>View Tasks</Link>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.96 }}>
                                    <Link to="/scheduler" className={SECONDARY_BUTTON}>Open Calendar</Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants} whileHover={{ y: -2 }} className={`${SURFACE_CARD} p-[1px] lg:col-span-8`}>
                        <div className="overflow-hidden rounded-[19px]">
                            <TaskSchedulerWidget tasks={tasks} />
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-5 lg:col-span-4">
                        <motion.div variants={itemVariants} whileHover={{ y: -2 }} className={`${SURFACE_CARD} overflow-hidden p-[1px]`}>
                            <div className="overflow-hidden rounded-[19px]">
                                <ProgressChartWidget data={tasks} />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} whileHover={{ y: -2 }} className={`${SURFACE_CARD} p-5`}>
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Execution shortcuts</p>
                            <div className="mt-3 flex flex-col gap-2">
                                <motion.div whileTap={{ scale: 0.96 }}>
                                    <Link to="/tasks/focus" className={PRIMARY_BUTTON}>Start Focus Mode</Link>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.96 }}>
                                    <Link to="/assistant" className={SECONDARY_BUTTON}>Open AI Assistant</Link>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.96 }}>
                                    <Link to="/roadmap/list" className={SECONDARY_BUTTON}>Review Learning Path</Link>
                                </motion.div>
                            </div>
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
