import React, { useMemo } from 'react';
import { Play, Sparkles, ArrowRight } from 'lucide-react';

const TodayExecution = React.memo(({
    user,
    todayTask,
    tasks,
    streak,
    onStartFocus,
    onChangeTask,
    loading
}) => {
    const completedCount = useMemo(() => {
        return (tasks || []).filter(t => t.status === 'completed').length;
    }, [tasks]);

    const totalCount = useMemo(() => {
        return Math.max((tasks || []).length, completedCount + (todayTask ? 1 : 0));
    }, [tasks, todayTask, completedCount]);

    return (
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 shadow-soft dark:shadow-none transition-colors duration-300 ring-1 ring-inset ring-black/5 dark:ring-white/5">
            {/* Mission Card */}
            {todayTask ? (
                <>
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-terracotta/80 mb-2">⚡ Today's Mission</p>
                        <h2 className="text-2xl font-black text-gray-950 dark:text-white mb-2">
                            {todayTask.title}
                        </h2>
                        {todayTask.reason && (
                            <p className="text-gray-600 dark:text-gray-300 flex items-start gap-2 text-sm">
                                <Sparkles className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                {todayTask.reason}
                            </p>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-5 space-y-2">
                        <div className="flex justify-between text-xs text-textSecondary dark:text-gray-400">
                            <span>Progress</span>
                            <span>{Math.round((completedCount / Math.max(totalCount, 1)) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-borderMuted dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-terracotta to-orange-500 transition-all duration-500"
                                style={{ width: `${(completedCount / Math.max(totalCount, 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onStartFocus}
                            disabled={!todayTask || loading}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-terracotta to-orange-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-terracotta/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200 text-sm"
                        >
                            <Play className="h-4 w-4 fill-current" />
                            Start Focus
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={onChangeTask}
                            className="px-6 py-2.5 border border-borderMuted dark:border-white/20 text-gray-950 dark:text-white font-semibold rounded-lg hover:bg-white/80 dark:hover:bg-white/10 transition-colors text-sm"
                        >
                            Change Task
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center py-8">
                    <p className="text-textSecondary dark:text-gray-400 text-sm">No task scheduled for today. Create one to get started!</p>
                </div>
            )}
        </section>
    );
});

export default TodayExecution;
