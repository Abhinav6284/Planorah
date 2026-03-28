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
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_35px_-28px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-[#121212] dark:shadow-none">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px] dark:bg-blue-600/10" />

            <div className="relative z-10 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold dark:bg-white/10">
                            👋
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                Ready to execute, {displayName}?
                            </h1>
                            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1 text-orange-500">
                                    <Flame className="h-4 w-4" fill="currentColor" />
                                    {streak || 0} day streak
                                </span>
                                <span>•</span>
                                <span>{completedCount}/{totalCount} missions done</span>
                                {milestoneData.current > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="text-blue-600 dark:text-blue-400">
                                            {milestoneData.daysRemaining} days to {milestoneData.nextMilestone}-day milestone
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    {milestoneData.current > 0 && (
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                                    Week {milestoneData.weekNumber} Progress
                                </span>
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                    {milestoneData.current % 7 || 7}/7 days
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900/30">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${milestoneData.progressPercent}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full rounded-full bg-blue-600 dark:bg-blue-400"
                                />
                            </div>
                            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                                {milestoneData.daysRemaining === 0 
                                    ? '🎉 Milestone reached!' 
                                    : `${milestoneData.daysRemaining} more days to complete this week!`}
                            </p>
                        </div>
                    )}

                    <div className="max-w-xl">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Today's Prime Mission
                        </p>
                        <h2 className="text-xl font-medium leading-relaxed text-slate-700 dark:text-slate-200">
                            {todayTask?.title || "Loading your mission..."}
                        </h2>
                        {todayTask?.reason && (
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                <Sparkles className="mr-1.5 inline-block h-3.5 w-3.5 text-amber-500" />
                                {todayTask.reason}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStartFocus}
                        disabled={!todayTask || loading}
                        className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:shadow-white/10 dark:hover:bg-slate-200"
                    >
                        <Play className="h-5 w-5 fill-current" />
                        <span>Start Focus Session</span>
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </motion.button>

                    <button
                        onClick={onChangeTask}
                        className="rounded-2xl border border-slate-200 px-4 py-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                        Change Task
                    </button>
                </div>
            </div>

            {/* Progress Bar Bottom */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100 dark:bg-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / Math.max(totalCount, 1)) * 100}%` }}
                    className="h-full bg-blue-500 dark:bg-white"
                />
            </div>
        </section>
    );
};

export default TodayExecution;
