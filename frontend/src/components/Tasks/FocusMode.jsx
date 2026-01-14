import React, { useState, useEffect } from 'react';
import { tasksService } from '../../api/tasksService';
import { motion, AnimatePresence } from 'framer-motion';
import PomodoroTimer from './PomodoroTimer';
import MDEditor from '@uiw/react-md-editor';

export default function FocusMode() {
    const [todayTasks, setTodayTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTodayTasks = useCallback(async () => {
        try {
            const response = await tasksService.getTodayTasks();
            const incompleteTasks = response.data.filter(t => t.status !== 'completed');
            setTodayTasks(incompleteTasks);
            if (incompleteTasks.length > 0 && !currentTask) {
                setCurrentTask(incompleteTasks[0]);
            }
        } catch (error) {
            console.error('Failed to fetch today tasks:', error);
        } finally {
            setLoading(false);
        }
    }, [currentTask]);

    useEffect(() => {
        fetchTodayTasks();
    }, [fetchTodayTasks]);

    const handleComplete = async () => {
        if (!currentTask) return;

        try {
            // Save notes first
            await tasksService.updateTask(currentTask.id, { notes });
            // Then complete
            await tasksService.completeTask(currentTask.id);

            // Move to next task
            const remaining = todayTasks.filter(t => t.id !== currentTask.id);
            setTodayTasks(remaining);
            setCurrentTask(remaining.length > 0 ? remaining[0] : null);
        } catch (error) {
            console.error('Failed to complete task:', error);
        }
    };

    const saveNotes = async () => {
        if (!currentTask) return;
        try {
            await tasksService.updateTask(currentTask.id, { notes });
        } catch (error) {
            console.error('Failed to save notes:', error);
        }
    };

    const exitFocusMode = () => {
        window.history.back();
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-400">Loading focus mode...</p>
        </div>;
    }

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex overflow-hidden">
            {/* Exit Button */}
            <button
                onClick={exitFocusMode}
                className="absolute top-6 right-6 z-50 p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Left: Today's Tasks */}
            <div className="w-80 border-r border-gray-100 dark:border-gray-800 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Today's Tasks</h2>
                <div className="space-y-2">
                    {todayTasks.map(task => (
                        <button
                            key={task.id}
                            onClick={() => setCurrentTask(task)}
                            className={`w-full text-left p-4 rounded-xl transition-all ${currentTask?.id === task.id
                                ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                                : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className="font-medium">{task.title}</div>
                            <div className="text-xs mt-1 opacity-70">⏱️ {task.estimated_minutes}min</div>
                        </button>
                    ))}
                    {todayTasks.length === 0 && (
                        <p className="text-gray-400 text-center py-8">All tasks completed! 🎉</p>
                    )}
                </div>
            </div>

            {/* Center: Active Task + Timer */}
            <div className="flex-1 flex flex-col items-center justify-center p-12">
                <AnimatePresence mode="wait">
                    {currentTask ? (
                        <motion.div
                            key={currentTask.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center max-w-2xl"
                        >
                            <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 dark:text-white mb-4">
                                {currentTask.title}
                            </h1>
                            <p className="text-xl text-gray-500 dark:text-gray-400 mb-12">
                                {currentTask.description}
                            </p>

                            <PomodoroTimer taskId={currentTask.id} estimatedMinutes={currentTask.estimated_minutes} />

                            <button
                                onClick={handleComplete}
                                className="mt-12 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium text-lg shadow-lg transition-all"
                            >
                                ✓ Mark Complete
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-4">
                                All Done for Today! 🎉
                            </h1>
                            <p className="text-xl text-gray-500 dark:text-gray-400">Take a well-deserved break.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right: Notes */}
            <div className="w-96 border-l border-gray-100 dark:border-gray-800 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notes</h2>
                {currentTask ? (
                    <div data-color-mode="auto">
                        <MDEditor
                            value={notes}
                            onChange={(val) => setNotes(val || '')}
                            preview="edit"
                            height={400}
                        />
                        <button
                            onClick={saveNotes}
                            className="mt-4 w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-80"
                        >
                            Save Notes
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">Select a task to add notes</p>
                )}
            </div>
        </div>
    );
}
