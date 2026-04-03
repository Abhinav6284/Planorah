import { useMemo } from 'react';
import { Play, Flame, Sparkles, ArrowRight } from 'lucide-react';

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
        <section className="rounded-2xl border border-white/20 bg-[#1a2540] p-8 relative overflow-hidden">

            <div>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Ready to execute,{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-orange-400">
                            {displayName}
                        </span>
                        ?
                    </h1>

                    {/* Stats Pills */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        {streak > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/15 border border-orange-500/30 backdrop-blur-sm">
                                <Flame className="h-5 w-5 text-orange-400" fill="currentColor" />
                                <span className="font-semibold text-orange-300">{streak} day streak</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta/15 border border-terracotta/30 backdrop-blur-sm">
                            <span className="font-semibold text-terracotta">{completedCount}/{totalCount} missions</span>
                        </div>
                        {milestoneData.current > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/15 border border-blue-500/30 backdrop-blur-sm">
                                <span className="font-semibold text-blue-300">{milestoneData.daysRemaining}d to {milestoneData.nextMilestone}-day</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mission Card */}
                {todayTask && (
                    <div className="mb-6 p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <p className="text-xs font-bold text-terracotta/80 uppercase tracking-wider mb-2">⚡ Today's Mission</p>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {todayTask.title}
                        </h2>
                        {todayTask.reason && (
                            <p className="text-gray-300 flex items-start gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                {todayTask.reason}
                            </p>
                        )}
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mb-6 space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Progress</span>
                        <span>{Math.round((completedCount / Math.max(totalCount, 1)) * 100)}%</span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-terracotta to-orange-400 transition-all duration-500"
                            style={{ width: `${(completedCount / Math.max(totalCount, 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onStartFocus}
                        disabled={!todayTask || loading}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-terracotta to-orange-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-terracotta/50 disabled:opacity-50 transition-all"
                    >
                        <Play className="h-5 w-5 fill-current" />
                        Start Focus Session
                        <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onChangeTask}
                        className="px-6 py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                    >
                        Change Task
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TodayExecution;
