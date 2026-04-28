import React, { useMemo } from 'react';
import { CheckCircle2, Flame, Timer, Target } from 'lucide-react';

const ExecutionFeed = React.memo(({ tasks, focusOpen, todayTask, streak, recentActivity }) => {
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
        <div style={{ 
            background: 'var(--el-bg)', 
            border: '1px solid var(--el-border)', 
            borderRadius: 12, 
            padding: 24, 
            boxShadow: 'var(--el-shadow-card)',
            height: '100%'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)' }} />
                <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)' }}>Activity Feed</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {feed.map((item) => (
                    <div key={item.id} style={{ 
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                        borderBottom: '1px solid var(--el-border-subtle)'
                    }}>
                        <div style={{ 
                            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: item.type === 'active' ? 'var(--el-text)' : 'var(--el-bg-secondary)',
                            color: item.type === 'active' ? '#fff' : 'var(--el-text-secondary)'
                        }}>
                            <item.icon style={{ width: 16, height: 16 }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--el-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.title}
                            </p>
                            {item.time && (
                                <p style={{ fontSize: 11, color: 'var(--el-text-muted)', marginTop: 1 }}>
                                    {item.time}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default ExecutionFeed;
