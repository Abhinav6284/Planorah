import React, { useMemo } from 'react';
import { Play, RefreshCw, Plus, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';

const toDateKey = (dateValue) => {
    if (!dateValue) {
        return null;
    }

    if (typeof dateValue === 'string') {
        const trimmed = dateValue.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed;
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

const TodayExecution = React.memo(({
    user,
    todayTask,
    tasks,
    streak,
    onStartFocus,
    onChangeTask,
    loading
}) => {
    const focusDateKey = useMemo(() => {
        return toDateKey(todayTask?.scheduled_for) || toDateKey(todayTask?.created_at);
    }, [todayTask]);

    const scopedTasks = useMemo(() => {
        const sourceTasks = Array.isArray(tasks) ? tasks : [];
        if (!focusDateKey) {
            return sourceTasks;
        }

        const sameDayTasks = sourceTasks.filter((task) => {
            const taskDateKey = toDateKey(task?.scheduled_for) || toDateKey(task?.created_at);
            return taskDateKey === focusDateKey;
        });

        return sameDayTasks.length ? sameDayTasks : sourceTasks;
    }, [tasks, focusDateKey]);

    const completedCount = useMemo(() => {
        return scopedTasks.filter(t => t.status === 'completed').length;
    }, [scopedTasks]);

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
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_-24px_rgba(15,23,42,0.55)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
            {/* Background decoration */}
            <div className="absolute right-0 top-0 -mr-20 -mt-20 h-56 w-56 rounded-full bg-blue-500/10 blur-[72px] dark:bg-blue-600/10" />

            <div className="relative z-10 flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-bold dark:bg-white/10">
                            👋
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                                Ready to execute, {displayName}?
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
                                        <span className="text-blue-600 dark:text-blue-400">
                                            {milestoneData.daysRemaining} days to {milestoneData.nextMilestone}-day milestone
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Mission Card */}
            {!isNewUser && todayTask ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center' }}>
                    {/* Left: Task Content */}
                    <div style={{ flex: 1, minWidth: 280 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 12 }}>Focus Task</p>
                        <h2 style={{ fontSize: 26, fontWeight: 300, color: 'var(--el-text)', letterSpacing: '-0.02em', marginBottom: 6 }}>
                            {todayTask.title}
                        </h2>
                        {todayTask.reason && (
                            <p style={{ fontSize: 15, color: 'var(--el-text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
                                {todayTask.reason}
                            </p>
                        )}

                        {/* Progress bar */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, fontWeight: 600 }}>
                                <span style={{ color: 'var(--el-text-muted)' }}>Daily Progress</span>
                                <span style={{ color: 'var(--el-text)' }}>{completedCount}/{totalCount}</span>
                            </div>
                            <div style={{ height: 6, background: 'var(--el-bg-secondary)', borderRadius: 10, overflow: 'hidden' }}>
                                <div
                                    style={{ 
                                        height: '100%', 
                                        background: 'var(--el-text)', 
                                        borderRadius: 10, 
                                        width: `${pct}%`,
                                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
                                    }}
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-blue-700 dark:text-blue-300">
                                {milestoneData.daysRemaining === 0
                                    ? '🎉 Milestone reached!'
                                    : `${milestoneData.daysRemaining} more days to complete this week!`}
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => onStartFocus(todayTask)}
                                disabled={!todayTask || loading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px', 
                                    background: 'var(--el-text)', color: 'var(--el-bg)', fontSize: 13, fontWeight: 700, 
                                    borderRadius: 9999, border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1,
                                    boxShadow: 'var(--el-shadow-button)'
                                }}
                            >
                                <Play style={{ width: 15, height: 15, fill: 'currentColor' }} />
                                Start Session
                            </button>
                            <button
                                onClick={onChangeTask}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', 
                                    background: 'var(--el-bg)', border: '1px solid var(--el-border)', 
                                    color: 'var(--el-text)', fontSize: 13, fontWeight: 600, 
                                    borderRadius: 9999, cursor: 'pointer',
                                    boxShadow: 'var(--el-shadow-inset)'
                                }}
                            >
                                <RefreshCw style={{ width: 14, height: 14 }} />
                                Swap Task
                            </button>
                        </div>
                    </div>

                    {/* Right: Circular Progress Ring */}
                    <div style={{ display: 'flex', flexDirection: 'column', items: 'center', gap: 16, textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: 120, height: 120 }}>
                            <svg style={{ width: 120, height: 120, transform: 'rotate(-90deg)' }} viewBox="0 0 120 120">
                                <circle
                                    cx="60" cy="60" r="54"
                                    stroke="var(--el-bg-secondary)" strokeWidth="8" fill="none"
                                />
                                <circle
                                    cx="60" cy="60" r="54"
                                    stroke="var(--el-text)" strokeWidth="8" fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(2 * Math.PI * 54).toFixed(2)}`}
                                    strokeDashoffset={`${(2 * Math.PI * 54 * (1 - pct / 100)).toFixed(2)}`}
                                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                />
                            </svg>
                            <div style={{ 
                                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', 
                                alignItems: 'center', justifyContent: 'center' 
                            }}>
                                <span style={{ fontSize: 28, fontWeight: 300, color: 'var(--el-text)', letterSpacing: '-0.04em' }}>{pct}%</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--el-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Done</span>
                            </div>
                        </div>
                        {todayTask.estimated_time && (
                            <div style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                                background: 'var(--el-bg-secondary)', borderRadius: 20, fontSize: 11, fontWeight: 600, color: 'var(--el-text-secondary)'
                            }}>
                                <Timer style={{ width: 12, height: 12 }} />
                                {todayTask.estimated_time}
                            </div>
                        )}
                    </div>
                </div>
            ) : null}

                <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:pt-1">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStartFocus}
                        disabled={!todayTask || loading}
                        className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:shadow-white/10 dark:hover:bg-slate-200"
                    >
                        <Play className="h-4 w-4 fill-current" />
                        <span>Start Focus Session</span>
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </motion.button>

                    <button
                        onClick={onChangeTask}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        Change Task
                    </button>
                </div>
            )}
        </section>
    );
});

export default TodayExecution;
