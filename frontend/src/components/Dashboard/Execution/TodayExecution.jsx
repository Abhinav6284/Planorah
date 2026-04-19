import React, { useMemo } from 'react';
import { Play, RefreshCw, Plus } from 'lucide-react';
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
        return Math.max(scopedTasks.length, completedCount + (todayTask ? 1 : 0));
    }, [scopedTasks, todayTask, completedCount]);

    const pct = Math.round((completedCount / Math.max(totalCount, 1)) * 100);

    // No tasks at all — new user empty state
    const isNewUser = !loading && (!tasks || tasks.length === 0);

    return (
        <section className="bg-gradient-to-br from-white to-gray-50/80 dark:from-[#1a1a1a] dark:to-[#151515] rounded-2xl border-0 p-6 transition-all duration-300 shadow-[0_10px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(217,108,74,0.2)]">
            {/* New user empty state */}
            {isNewUser ? (
                <div className="flex flex-col lg:flex-row lg:items-center gap-8 py-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-1.5 bg-terracotta rounded-full" />
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Getting Started</p>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-950 dark:text-white leading-tight mb-2">
                            Create your first task
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            Add a task or generate a learning roadmap to get your personalized plan.
                        </p>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/tasks"
                                className="flex items-center gap-2 px-6 py-3 bg-terracotta text-white text-sm font-semibold rounded-xl hover:bg-terracottaHover hover:shadow-lg hover:shadow-terracotta/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                            >
                                <Plus className="w-4 h-4" />
                                Add a Task
                            </Link>
                            <Link
                                to="/roadmap/generate"
                                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-600 dark:text-gray-400 font-medium border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-150"
                            >
                                Generate Roadmap
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:flex flex-col items-center gap-3 pt-2 min-w-[180px]">
                        <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center">
                            <Plus className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">No tasks yet</p>
                    </div>
                </div>
            ) : null}

            {/* Mission Card */}
            {!isNewUser && todayTask ? (
                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                    {/* Left: Task Content */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-1.5 bg-terracotta rounded-full" />
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Focus Task</p>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-950 dark:text-white leading-tight mb-2">
                            {todayTask.title}
                        </h2>
                        {todayTask.reason && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                                {todayTask.reason}
                            </p>
                        )}

                        {/* Progress bar */}
                        <div className="mb-6">
                            <div className="flex justify-between mb-2 text-xs text-gray-400 dark:text-gray-500">
                                <span>Progress</span>
                                <span>{completedCount}/{totalCount}</span>
                            </div>
                            <div className="h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-terracotta rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onStartFocus(todayTask)}
                                disabled={!todayTask || loading}
                                className="flex items-center gap-2 px-6 py-3 bg-terracotta text-white text-sm font-semibold rounded-xl hover:bg-terracottaHover hover:shadow-lg hover:shadow-terracotta/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-150"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Start Session
                            </button>
                            <button
                                onClick={onChangeTask}
                                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-600 dark:text-gray-400 font-medium border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-150"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Swap Task
                            </button>
                        </div>
                    </div>

                    {/* Right: Circular Progress Ring — hidden on mobile */}
                    <div className="hidden lg:flex flex-col items-center gap-3 pt-2 min-w-[180px]">
                        <div className="relative w-32 h-32">
                            <svg className={`w-32 h-32 -rotate-90 ${pct > 0 ? 'filter drop-shadow-[0_0_12px_rgba(217,108,74,0.3)]' : ''}`} viewBox="0 0 128 128">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="52"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    className="text-gray-100 dark:text-white/10"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="52"
                                    stroke="#D96C4A"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(2 * Math.PI * 52).toFixed(2)}`}
                                    strokeDashoffset={`${(2 * Math.PI * 52 * (1 - pct / 100)).toFixed(2)}`}
                                    className="transition-all duration-700"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-950 dark:text-white">{pct}%</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">done</span>
                            </div>
                        </div>
                        {todayTask.estimated_time && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">{todayTask.estimated_time}</p>
                        )}
                    </div>
                </div>
            ) : null}

            {/* Fallback: has tasks but no today task yet */}
            {!isNewUser && !todayTask && (
                <div className="text-center py-12">
                    <p className="text-sm text-gray-400 dark:text-gray-500">No task scheduled for today.</p>
                    <Link to="/tasks" className="text-xs text-terracotta hover:underline mt-1 inline-block">+ Add a task</Link>
                </div>
            )}
        </section>
    );
});

export default TodayExecution;
