import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tasksService } from '../../api/tasksService';
import { roadmapService } from '../../api/roadmapService';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import Loader from '../common/Loader';
import { FaUndo } from 'react-icons/fa';

export default function TaskList() {
    const [searchParams] = useSearchParams();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [roadmaps, setRoadmaps] = useState([]);
    const [selectedRoadmap, setSelectedRoadmap] = useState('all');
    const [highlightedTaskId, setHighlightedTaskId] = useState(null);

    // Undo state
    const [deletedTask, setDeletedTask] = useState(null);
    const [showUndo, setShowUndo] = useState(false);
    const undoTimeoutRef = useRef(null);
    const taskRefs = useRef({});

    // Handle taskId from URL (from calendar navigation)
    useEffect(() => {
        const taskId = searchParams.get('taskId');
        if (taskId) {
            setHighlightedTaskId(parseInt(taskId));
            // Clear filter to show all tasks when navigating from calendar
            setFilter('all');
            setSelectedRoadmap('all');
        }
    }, [searchParams]);

    // Scroll to highlighted task when tasks load
    useEffect(() => {
        if (highlightedTaskId && taskRefs.current[highlightedTaskId] && !loading) {
            setTimeout(() => {
                taskRefs.current[highlightedTaskId]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 300);
        }
    }, [highlightedTaskId, loading, tasks]);

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    useEffect(() => {
        fetchTasks();
        return () => {
            if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
        };
    }, [filter, selectedRoadmap]);

    const fetchRoadmaps = async () => {
        try {
            const data = await roadmapService.getUserRoadmaps();
            setRoadmaps(data);
        } catch (error) {
            console.error('Failed to fetch roadmaps:', error);
        }
    };

    const fetchTasks = async () => {
        try {
            const filters = {};
            if (filter !== 'all') filters.status = filter;
            if (selectedRoadmap !== 'all') filters.roadmap = selectedRoadmap;
            const response = await tasksService.getTasks(filters);
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (taskId, updates) => {
        try {
            await tasksService.updateTask(taskId, updates);
            fetchTasks();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const completeTask = async (taskId) => {
        try {
            await tasksService.completeTask(taskId);
            fetchTasks();
        } catch (error) {
            console.error('Failed to complete task:', error);
        }
    };

    const handleDeleteClick = (task) => {
        if (undoTimeoutRef.current) {
            clearTimeout(undoTimeoutRef.current);
            if (deletedTask) {
                tasksService.deleteTask(deletedTask.id);
            }
        }

        setDeletedTask(task);
        setTasks(prev => prev.filter(t => t.id !== task.id));
        setShowUndo(true);

        undoTimeoutRef.current = setTimeout(async () => {
            try {
                await tasksService.deleteTask(task.id);
                setShowUndo(false);
                setDeletedTask(null);
            } catch (error) {
                console.error("Failed to delete task:", error);
                fetchTasks();
            }
        }, 3000);
    };

    const handleUndo = () => {
        if (undoTimeoutRef.current) {
            clearTimeout(undoTimeoutRef.current);
            undoTimeoutRef.current = null;
        }
        if (deletedTask) {
            setTasks(prev => [...prev, deletedTask]);
            setDeletedTask(null);
            setShowUndo(false);
        }
    };

    // Grouping Logic
    const groupedTasks = tasks.reduce((acc, task) => {
        const roadmapTitle = task.roadmap_title || 'General Tasks';
        if (!acc[roadmapTitle]) {
            acc[roadmapTitle] = {};
        }
        const dayKey = `Day ${task.day}`;
        if (!acc[roadmapTitle][dayKey]) {
            acc[roadmapTitle][dayKey] = [];
        }
        acc[roadmapTitle][dayKey].push(task);
        return acc;
    }, {});

    // Progress calculation
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const totalCount = tasks.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // Get selected roadmap name
    const selectedRoadmapName = selectedRoadmap === 'all'
        ? 'All Roadmaps'
        : roadmaps.find(r => String(r.id) === String(selectedRoadmap))?.title || 'Roadmap';

    if (loading) return <Loader message="Loading your tasks..." />;

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 md:p-10 relative">
                <header className="mb-8">
                    <h1 className="text-3xl font-serif font-medium text-gray-900 dark:text-white mb-2">My Tasks</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your learning journey day by day</p>
                </header>

                {/* Roadmap Selector */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Roadmap
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedRoadmap}
                                    onChange={(e) => {
                                        setSelectedRoadmap(e.target.value);
                                        setLoading(true);
                                    }}
                                    className="w-full md:w-80 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                >
                                    <option value="all">📚 All Roadmaps</option>
                                    {roadmaps.map(roadmap => (
                                        <option key={roadmap.id} value={roadmap.id}>
                                            🎯 {roadmap.title}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {selectedRoadmap !== 'all' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl"
                            >
                                <span className="text-sm font-medium">Viewing: {selectedRoadmapName}</span>
                                <button
                                    onClick={() => {
                                        setSelectedRoadmap('all');
                                        setLoading(true);
                                    }}
                                    className="ml-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-200"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-900 dark:text-white">
                            {selectedRoadmap === 'all' ? 'Overall Progress' : `${selectedRoadmapName} Progress`}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{completedCount} / {totalCount} completed</span>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    {['all', 'not_started', 'in_progress', 'completed', 'needs_revision'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === status
                                ? 'bg-black dark:bg-white text-white dark:text-black'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {status === 'all' ? 'All Tasks' : status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                    ))}
                </div>

                {/* Grouped Task List */}
                <div className="space-y-12">
                    {Object.keys(groupedTasks).length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <p className="text-gray-400 text-lg mb-6">
                                {selectedRoadmap === 'all'
                                    ? 'No tasks found. Generate a roadmap to get started! 🚀'
                                    : 'No tasks found for this roadmap. Schedule your roadmap to generate tasks! 📅'}
                            </p>
                            <button
                                onClick={() => window.location.href = '/roadmap/list'}
                                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:scale-105 transition-transform shadow-lg"
                            >
                                Go to Learning Path
                            </button>
                        </div>
                    ) : (
                        Object.entries(groupedTasks).map(([roadmapTitle, days]) => (
                            <div key={roadmapTitle} className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                                    {roadmapTitle}
                                </h2>
                                <div className="space-y-8">
                                    {Object.entries(days)
                                        .sort((a, b) => parseInt(a[0].split(' ')[1]) - parseInt(b[0].split(' ')[1]))
                                        .map(([day, dayTasks]) => (
                                            <div key={day} className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                                    <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm">{day}</span>
                                                    <span className="text-sm font-normal text-gray-500">
                                                        ({dayTasks.length} tasks)
                                                    </span>
                                                </h3>
                                                <div className="grid gap-4">
                                                    {dayTasks.map(task => (
                                                        <div
                                                            key={task.id}
                                                            ref={el => taskRefs.current[task.id] = el}
                                                            className={`relative group transition-all duration-500 ${highlightedTaskId === task.id
                                                                    ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800 rounded-xl'
                                                                    : ''
                                                                }`}
                                                        >
                                                            {task.milestone_title && (
                                                                <div className="absolute -top-2 left-4 z-10">
                                                                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100 dark:border-blue-800">
                                                                        {task.milestone_title}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className={task.milestone_title ? "pt-2" : ""}>
                                                                <TaskCard
                                                                    task={task}
                                                                    onUpdate={updateTask}
                                                                    onComplete={completeTask}
                                                                    onDelete={() => handleDeleteClick(task)}
                                                                    isHighlighted={highlightedTaskId === task.id}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Undo Toast */}
                <AnimatePresence>
                    {showUndo && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-8 right-8 bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-50"
                        >
                            <span className="font-medium">Task deleted</span>
                            <button
                                onClick={handleUndo}
                                className="flex items-center gap-2 bg-gray-700 dark:bg-gray-200 text-white dark:text-black px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors"
                            >
                                <FaUndo className="text-xs" /> Undo
                            </button>
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-blue-500"
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 3, ease: "linear" }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
