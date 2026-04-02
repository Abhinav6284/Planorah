import React, { useMemo } from 'react';
import { Play, Sparkles, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const TodayExecution = ({
    user,
    todayTask,
    tasks,
    streak,
    onStartFocus,
    onChangeTask,
    loading
}) => {
    const displayName = useMemo(() => {
        const firstName = user?.first_name;
        if (firstName) return firstName;
        return user?.username || 'there';
    }, [user]);

    const completedCount = useMemo(() => {
        return (tasks || []).filter(t => t.status === 'completed').length;
    }, [tasks]);

    const totalCount = useMemo(() => {
        return Math.max((tasks || []).length, completedCount + (todayTask ? 1 : 0));
    }, [tasks, todayTask, completedCount]);

    // Milestone calculation: 7, 14, 21, 28...
    const milestoneData = useMemo(() => {
        const currentStreak = streak || 0;
        const weekNumber = Math.ceil(currentStreak / 7) || 1;
        const nextMilestone = weekNumber * 7;
        const daysIntoCurrentWeek = currentStreak % 7;
        const progressPercent = currentStreak > 0 ? Math.round((daysIntoCurrentWeek / 7) * 100) : 0;
        
        return {
            current: currentStreak,
            nextMilestone,
            daysRemaining: nextMilestone - currentStreak,
            progressPercent,
            weekNumber
        };
    }, [streak]);

    return (
        <section className="relative overflow-hidden rounded-3xl border border-borderMuted/50 bg-gradient-to-br from-white via-white/95 to-beigePrimary/40 backdrop-blur-xl shadow-warmHover dark:border-white/5 dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:via-[#121212] dark:to-[#0f0f0f] dark:shadow-darkDepth">
            {/* Background decoration */}
            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-terracotta/15 to-transparent blur-[100px] dark:from-terracotta/5" />
            <div className="absolute -left-40 -bottom-40 h-96 w-96 rounded-full bg-gradient-to-tr from-sage/10 to-transparent blur-[100px] dark:from-sage/5" />

            <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta/20 to-sage/20 text-2xl font-bold dark:from-terracotta/10 dark:to-sage/10">
                            👋
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                                Ready to execute, <span className="text-terracotta">{displayName}</span>?
                            </h1>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1 text-orange-500">
                                    <Flame className="h-3.5 w-3.5" fill="currentColor" />
                                    {streak || 0} day streak
                                </span>
                                <span>•</span>
                                <span>{completedCount}/{totalCount} missions done</span>
                                {milestoneData.current > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="text-terracotta dark:text-terracotta/80">
                                            {milestoneData.daysRemaining} days to {milestoneData.nextMilestone}-day milestone
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    {milestoneData.current > 0 && (
                        <div className="rounded-2xl border border-terracotta/30 bg-gradient-to-br from-terracotta/8 to-transparent p-4 backdrop-blur-sm dark:border-terracotta/20 dark:bg-gradient-to-br dark:from-terracotta/10 dark:to-transparent">
                            <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-terracotta dark:text-terracotta/80">
                                    Week {milestoneData.weekNumber} Progress
                                </span>
                                <span className="text-xs font-bold text-terracotta dark:text-terracotta/80">
                                    {milestoneData.current % 7 || 7}/7 days
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gradient-to-r from-terracotta/20 to-terracotta/10 dark:from-terracotta/10 dark:to-terracotta/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${milestoneData.progressPercent}%` }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-terracotta to-terracottaHover shadow-lg shadow-terracotta/30 dark:from-terracotta dark:to-terracotta/80"
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-terracotta dark:text-terracotta/80">
                                {milestoneData.daysRemaining === 0
                                    ? '🎉 Milestone reached!'
                                    : `${milestoneData.daysRemaining} more days to complete this week!`}
                            </p>
                        </div>
                    )}

                    <div className="max-w-2xl">
                        <p className="mb-2 text-[12px] font-bold uppercase tracking-widest text-terracotta dark:text-terracotta/80">
                            ✦ Today's Prime Mission
                        </p>
                        <h2 className="text-xl font-semibold leading-snug text-slate-900 dark:text-white sm:text-2xl">
                            {todayTask?.title || "Loading your mission..."}
                        </h2>
                        {todayTask?.reason && (
                            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                                <Sparkles className="mr-1.5 inline-block h-3 w-3 text-amber-500" />
                                {todayTask.reason}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:pt-1">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onStartFocus}
                        disabled={!todayTask || loading}
                        className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-terracotta to-terracottaHover px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-terracotta/40 transition-all hover:shadow-terracotta/60 disabled:cursor-not-allowed disabled:opacity-70 dark:from-terracotta dark:to-terracottaHover dark:shadow-terracotta/30 dark:hover:shadow-terracotta/50"
                    >
                        <Play className="h-4 w-4 fill-current" />
                        <span>Start Focus Session</span>
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onChangeTask}
                        className="rounded-xl border border-borderMuted/60 bg-white/40 px-5 py-3.5 text-sm font-semibold text-textPrimary backdrop-blur-sm transition-all hover:bg-white/70 hover:border-terracotta/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:border-terracotta/30"
                    >
                        Change Task
                    </motion.button>
                </div>
            </div>

            {/* Progress Bar Bottom */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-terracotta/10 to-transparent dark:via-terracotta/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / Math.max(totalCount, 1)) * 100}%` }}
                    className="h-full bg-gradient-to-r from-terracotta to-terracottaHover"
                />
            </div>
        </section>
    );
};

export default TodayExecution;
