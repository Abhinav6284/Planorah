import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { schedulerService } from "../../api/schedulerService";
import { roadmapService } from "../../api/roadmapService";
import { FaGoogle, FaClock, FaPlay, FaPause, FaRedo, FaSync } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import WeeklyCalendar from "../common/WeeklyCalendar";

export default function Scheduler() {
    const [tasks, setTasks] = useState([]);
    const [roadmaps, setRoadmaps] = useState([]);
    const [timerActive, setTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [activeTask, setActiveTask] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [calendarKey, setCalendarKey] = useState(0); // Force calendar refresh

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();

        // Handle Google OAuth Callback
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        if (code) {
            handleGoogleCallback(code);
        }
    }, [location]);

    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false);
            // Play sound or notify
            alert("Focus session complete!");
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const fetchData = async () => {
        try {
            const [tasksData, roadmapsData] = await Promise.all([
                schedulerService.getTasks(),
                roadmapService.getUserRoadmaps(),
            ]);
            setTasks(tasksData);
            setRoadmaps(roadmapsData);
        } catch (err) {
            console.error("Failed to fetch scheduler data", err);
        }
    };

    const handleGoogleCallback = async (code) => {
        setSyncing(true);
        try {
            await schedulerService.handleGoogleCallback(code);
            alert("Google Calendar connected successfully!");
            navigate('/scheduler', { replace: true });
        } catch (err) {
            console.error("Google Auth Error", err);
            alert("Failed to connect Google Calendar");
        } finally {
            setSyncing(false);
        }
    };

    const connectGoogleCalendar = async () => {
        try {
            const data = await schedulerService.getGoogleAuthUrl();
            window.location.href = data.url;
        } catch (err) {
            console.error("Failed to get auth URL", err);
        }
    };

    const syncCalendar = async () => {
        setSyncing(true);
        try {
            await schedulerService.syncGoogleCalendar();
            setCalendarKey(prev => prev + 1); // Force calendar refresh
            alert("Calendar synced!");
        } catch (err) {
            console.error("Sync Error", err);
            alert("Failed to sync calendar. Try connecting again.");
        } finally {
            setSyncing(false);
        }
    };

    const handleScheduleRoadmap = async (roadmapId) => {
        const startDate = prompt("Enter start date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
        if (startDate) {
            try {
                await roadmapService.scheduleRoadmap(roadmapId, startDate);
                fetchData();
                setCalendarKey(prev => prev + 1); // Force calendar refresh
                alert("Roadmap scheduled! Check your calendar.");
            } catch (err) {
                console.error("Schedule error:", err);
                alert("Failed to schedule roadmap");
            }
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        // console.log("Dragged", result);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const toggleTimer = () => setTimerActive(!timerActive);
    const resetTimer = () => {
        setTimerActive(false);
        setTimeLeft(25 * 60);
    };

    const handleEventClick = (event) => {
        console.log("Event clicked:", event);
    };

    return (
        <div className="flex h-full bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-200">

            {/* Sidebar / Task List */}
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm z-10">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-6">My Tasks</h2>

                    {/* Focus Timer Widget */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/70">Focus Mode</span>
                            <FaClock className="text-white/70" />
                        </div>
                        <div className="text-5xl font-medium text-center mb-6 tracking-tight">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={toggleTimer} className="w-12 h-12 flex items-center justify-center bg-white text-indigo-600 rounded-full hover:bg-gray-100 transition-colors shadow-md">
                                {timerActive ? <FaPause /> : <FaPlay className="ml-1" />}
                            </button>
                            <button onClick={resetTimer} className="w-12 h-12 flex items-center justify-center border border-white/30 rounded-full hover:bg-white/10 transition-colors">
                                <FaRedo />
                            </button>
                        </div>
                        {activeTask && (
                            <div className="mt-4 text-xs text-center text-white/70 font-medium">
                                Focusing on: <span className="text-white">{activeTask.title}</span>
                            </div>
                        )}
                    </div>

                    <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg mb-6">
                        + Add New Task
                    </button>

                    <div className="mb-4">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Roadmaps to Schedule</h3>
                        {roadmaps.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500">No roadmaps available</p>
                        ) : (
                            roadmaps.map(r => (
                                <div key={r.id} className="flex justify-between items-center text-sm mb-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <span className="truncate w-40 font-medium text-gray-700 dark:text-gray-300">{r.title}</span>
                                    <button
                                        onClick={() => handleScheduleRoadmap(r.id)}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded"
                                    >
                                        Schedule
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="tasks">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    {tasks.map((task, index) => (
                                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                                                    onClick={() => setActiveTask(task)}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</h3>
                                                        <span className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-400' :
                                                            task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                                                            }`} />
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                        <span className="flex items-center gap-1">
                                                            🍅 {task.estimated_pomodoros}
                                                        </span>
                                                        <button className="hover:text-indigo-500 transition-colors"><FaGoogle /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>

            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
                <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                    <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Schedule</h1>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={connectGoogleCalendar}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white transition-colors"
                        >
                            <FaGoogle className="text-red-500" />
                            Connect Calendar
                        </button>

                        <button
                            onClick={syncCalendar}
                            disabled={syncing}
                            className={`p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors ${syncing ? 'animate-spin' : ''}`}
                        >
                            <FaSync />
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-hidden">
                    <WeeklyCalendar key={calendarKey} onEventClick={handleEventClick} />
                </div>
            </div>
        </div>
    );
}
