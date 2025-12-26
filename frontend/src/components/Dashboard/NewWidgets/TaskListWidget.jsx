import React from 'react';

const TodayTasksWidget = ({ tasks = [] }) => {
    // Filter for today's tasks or show sample data
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const taskList = tasks.length > 0 ? tasks.slice(0, 6) : [
        { id: 1, title: 'Complete React Module', time: 'Due 10:00 AM', status: 'completed', icon: '📚' },
        { id: 2, title: 'Review Pull Request', time: 'Due 12:30 PM', status: 'completed', icon: '🔍' },
        { id: 3, title: 'Algorithm Practice', time: 'Due 2:00 PM', status: 'in_progress', icon: '💻' },
        { id: 4, title: 'Team Standup', time: 'Due 4:00 PM', status: 'not_started', icon: '👥' },
        { id: 5, title: 'Read Documentation', time: 'Due 6:00 PM', status: 'not_started', icon: '📖' },
    ];

    const completedCount = taskList.filter(t => t.status === 'completed').length;

    return (
        <div className="bg-[#1C1C1E] text-white rounded-[28px] p-5 h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-base font-semibold">Today's Tasks</h3>
                    <p className="text-xs opacity-50 mt-0.5">{today}</p>
                </div>
                <span className="text-sm px-3 py-1 bg-yellow-500 text-black font-bold rounded-full">
                    {completedCount}/{taskList.length}
                </span>
            </div>

            {/* List */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {taskList.map((task, i) => {
                    const isCompleted = task.status === 'completed';
                    const isInProgress = task.status === 'in_progress';

                    return (
                        <div
                            key={task.id || i}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${isCompleted ? 'bg-white/5' : isInProgress ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' :
                                    isInProgress ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-white/10'
                                }`}>
                                {task.icon || '📋'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium truncate ${isCompleted ? 'opacity-50 line-through' : ''}`}>
                                    {task.title}
                                </div>
                                <div className="text-[11px] opacity-40">{task.time || `Day ${task.day}`}</div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-emerald-500 border-emerald-500' :
                                    isInProgress ? 'border-yellow-500 bg-yellow-500/20' :
                                        'border-gray-600'
                                }`}>
                                {isCompleted && <span className="text-[10px] text-white">✓</span>}
                                {isInProgress && <span className="text-[8px] text-yellow-400">●</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View All Link */}
            <a href="/tasks" className="mt-3 text-center text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
                View all tasks →
            </a>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        </div>
    );
};

export default TodayTasksWidget;

