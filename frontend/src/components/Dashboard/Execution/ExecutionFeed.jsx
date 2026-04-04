import { useMemo } from 'react';
import { CheckCircle2, Flame, Timer, Target } from 'lucide-react';

const ExecutionFeed = ({ tasks, focusOpen, todayTask, streak, recentActivity }) => {
    // Extract recent completions from API data or fallback to tasks
    const recentCompletions = useMemo(() => {
        if (Array.isArray(recentActivity) && recentActivity.length) {
            return recentActivity
                .filter((item) => item.status === 'completed')
                .slice(0, 4)
                .map((item, idx) => ({
                    id: `recent-${idx}`,
                    icon: CheckCircle2,
                    title: item.title,
                    type: 'completed',
                    time: item.completed_at
                        ? new Date(item.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : item.updated_at
                            ? new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '',
                }));
        }
        // Fallback: derive from tasks
        return [...(tasks || [])]
            .filter((task) => task?.status === 'completed')
            .sort((a, b) => new Date(b?.completed_at || b?.updated_at) - new Date(a?.completed_at || a?.updated_at))
            .slice(0, 4)
            .map((task) => ({
                id: `done-${task.id}`,
                icon: CheckCircle2,
                title: task.title,
                type: 'completed',
                time: String(task?.completed_at || task?.updated_at || '').slice(11, 16),
            }));
    }, [recentActivity, tasks]);

    const feed = useMemo(() => {
        const items = [];

        if (focusOpen) {
            items.push({
                id: 'focus-now',
                icon: Timer,
                title: todayTask?.title || 'Deep work session',
                type: 'active',
                time: 'Now'
            });
        }

        items.push(...recentCompletions);

        if (streak > 0) {
            items.push({
                id: 'streak',
                icon: Flame,
                title: `${streak} day streak`,
                type: 'streak',
                time: 'Today'
            });
        }

        if (!items.length) {
            items.push({
                id: 'empty',
                icon: Target,
                title: 'Ready to start?',
                type: 'empty',
                time: ''
            });
        }

        return items;
    }, [focusOpen, todayTask, streak, recentCompletions]);

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 shadow-soft dark:shadow-none transition-colors duration-300">
            <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <h3 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-widest">Activity Feed</h3>
                </div>
            </div>

            <div className="space-y-3">
                {feed.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-white/10 last:border-0">
                        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                            item.type === 'active' ? 'bg-terracotta/20 text-terracotta' :
                            item.type === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                            item.type === 'streak' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-200/50 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                        }`}>
                            <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-950 dark:text-white truncate">
                                {item.title}
                            </p>
                            {item.time && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {item.time}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExecutionFeed;
