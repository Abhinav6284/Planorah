import React, { useMemo } from 'react';
import { CheckCircle2, Flame, Timer, Target } from 'lucide-react';

const ExecutionFeed = ({ tasks, focusOpen, todayTask, streak }) => {
    const feed = useMemo(() => {
        const items = [];

        // Recent completions
        const recentCompletions = [...(tasks || [])]
            .filter((task) => task?.status === 'completed')
            .sort((a, b) => new Date(b?.completed_at || b?.updated_at) - new Date(a?.completed_at || a?.updated_at))
            .slice(0, 5)
            .map((task) => ({
                id: `done-${task.id}`,
                icon: CheckCircle2,
                tone: 'text-emerald-500',
                bg: 'bg-emerald-500/10',
                title: task.title,
                note: `Completed ${task.task_type === 'exam' ? 'exam mission' : 'learning mission'}`,
                time: String(task?.completed_at || task?.updated_at || '').slice(11, 16),
            }));

        items.push(...recentCompletions);

        // Active Focus
        if (focusOpen) {
            items.unshift({
                id: 'focus-now',
                icon: Timer,
                tone: 'text-blue-500',
                bg: 'bg-blue-500/10',
                title: todayTask?.title || 'Deep work session',
                note: 'Focus session in progress',
                time: 'Now',
                active: true
            });
        }

        // Streak event
        if (streak > 0) {
            items.push({
                id: 'streak-event',
                icon: Flame,
                tone: 'text-orange-500',
                bg: 'bg-orange-500/10',
                title: `${streak} day streak active`,
                note: 'Consistency momentum maintained',
                time: 'Today',
            });
        }

        // Fallback
        if (!items.length) {
            items.push({
                id: 'starter',
                icon: Target,
                tone: 'text-slate-400',
                bg: 'bg-slate-100 dark:bg-white/5',
                title: 'Ready to start?',
                note: 'Complete your first mission to activate the feed.',
                time: '',
            });
        }

        return items.slice(0, 6);
    }, [tasks, focusOpen, todayTask, streak]);

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#121212]">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Execution Feed</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Live activity log</p>
                </div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-4">
                {feed.map((item, index) => (
                    <div key={item.id} className="relative flex gap-4">
                        {/* Connector Line */}
                        {index !== feed.length - 1 && (
                            <div className="absolute left-4 top-8 -bottom-6 w-px bg-slate-100 dark:bg-white/10" />
                        )}

                        <div className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${item.bg} ${item.tone}`}>
                            <item.icon className="h-4 w-4" />
                            {item.active && (
                                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-ping rounded-full bg-blue-500 opacity-75" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1 py-0.5">
                            <div className="flex justify-between">
                                <p className={`truncate text-sm font-semibold ${item.active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {item.title}
                                </p>
                                <span className="whitespace-nowrap text-xs text-slate-400 dark:text-slate-500">
                                    {item.time}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.note}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExecutionFeed;
