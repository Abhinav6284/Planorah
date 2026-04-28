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
        return Math.max(scopedTasks.length, completedCount + (todayTask ? 1 : 0));
    }, [scopedTasks, todayTask, completedCount]);

    const pct = Math.round((completedCount / Math.max(totalCount, 1)) * 100);

    // No tasks at all — new user empty state
    const isNewUser = !loading && (!tasks || tasks.length === 0);

    return (
        <section 
            style={{ 
                background: 'var(--el-bg)', 
                border: '1px solid var(--el-border)', 
                borderRadius: 12, 
                padding: 24, 
                boxShadow: 'var(--el-shadow-card)',
                transition: 'all 0.3s ease'
            }}
        >
            {/* New user empty state */}
            {isNewUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--el-text-muted)', marginBottom: 12 }}>Getting Started</p>
                        <h2 style={{ fontSize: 28, fontWeight: 300, color: 'var(--el-text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
                            Create your first task
                        </h2>
                        <p style={{ fontSize: 14, color: 'var(--el-text-muted)', lineHeight: 1.6, marginBottom: 24, maxWidth: 500 }}>
                            Add a task or generate a learning roadmap to get your personalized plan.
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Link
                                to="/tasks"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', 
                                    background: 'var(--el-text)', color: 'var(--el-bg)', fontSize: 13, fontWeight: 700, 
                                    borderRadius: 9999, textDecoration: 'none', transition: 'opacity 0.2s',
                                    boxShadow: 'var(--el-shadow-button)'
                                }}
                            >
                                <Plus style={{ width: 16, height: 16 }} />
                                Add a Task
                            </Link>
                            <Link
                                to="/roadmap/generate"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', 
                                    background: 'var(--el-bg)', border: '1px solid var(--el-border)', 
                                    color: 'var(--el-text)', fontSize: 13, fontWeight: 600, 
                                    borderRadius: 9999, textDecoration: 'none',
                                    boxShadow: 'var(--el-shadow-inset)'
                                }}
                            >
                                Generate Roadmap
                            </Link>
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

            {/* Fallback: has tasks but no today task yet */}
            {!isNewUser && !todayTask && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <p style={{ fontSize: 14, color: 'var(--el-text-muted)', marginBottom: 12 }}>No task scheduled for today.</p>
                    <Link to="/tasks" style={{ fontSize: 13, fontWeight: 700, color: 'var(--el-text)', textDecoration: 'none' }}>+ Add a task</Link>
                </div>
            )}
        </section>
    );
});

export default TodayExecution;
