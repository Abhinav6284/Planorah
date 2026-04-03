import { useMemo } from 'react';
import { CheckCircle2, Flame, Timer, Target } from 'lucide-react';

const ExecutionFeed = ({ tasks, focusOpen, todayTask, streak }) => {
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

        const recentCompletions = [...(tasks || [])]
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
    }, [tasks, focusOpen, todayTask, streak]);

    return (
        <div className="rounded-2xl border border-white/20 bg-[#1a2540] p-6">
            <h3 className="text-sm font-bold text-white mb-5 uppercase tracking-wide">Activity Feed</h3>

            <div className="space-y-3">
                {feed.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-white/10 last:border-0">
                        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                            item.type === 'active' ? 'bg-terracotta/20 text-terracotta' :
                            item.type === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                            item.type === 'streak' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-white/10 text-gray-400'
                        }`}>
                            <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {item.title}
                            </p>
                            {item.time && (
                                <p className="text-xs text-gray-400 mt-1">
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
