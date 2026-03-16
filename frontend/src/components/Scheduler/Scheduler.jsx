import React, { useState, useEffect, useCallback, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { schedulerService } from "../../api/schedulerService";
import { roadmapService } from "../../api/roadmapService";
import { FaGoogle, FaClock, FaPlay, FaPause, FaRedo, FaSync, FaTrash, FaBars, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import WeeklyCalendar from "../common/WeeklyCalendar";
import { AnimatePresence, motion } from "framer-motion";

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_FOCUS_SECONDS = DEFAULT_FOCUS_MINUTES * 60;
const GOOGLE_STATE_KEY = "google_calendar_oauth_state";
const GOOGLE_REDIRECT_URI_KEY = "google_calendar_redirect_uri";

const getTaskTimerSeconds = (task) => {
    const minutes = Number(task?.estimated_minutes);
    if (Number.isFinite(minutes) && minutes > 0) {
        return Math.round(minutes * 60);
    }
    return DEFAULT_FOCUS_SECONDS;
};

export default function Scheduler() {
    const [tasks, setTasks] = useState([]);
    const [roadmaps, setRoadmaps] = useState([]);
    const [timerActive, setTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_SECONDS);
    const [activeTask, setActiveTask] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [calendarKey, setCalendarKey] = useState(0); // Force calendar refresh
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state
    const [scheduleModal, setScheduleModal] = useState(null); // { roadmapId, roadmapTitle }
    const [scheduleForm, setScheduleForm] = useState({ startDate: new Date().toISOString().split('T')[0], startTime: '09:00' });
    const [scheduling, setScheduling] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const processedGoogleCodeRef = useRef(null);

    const handleGoogleCallback = useCallback(async (code, state, redirectUriOverride) => {
        setSyncing(true);
        try {
            const redirectUri = redirectUriOverride || `${window.location.origin}/scheduler`;
            await schedulerService.handleGoogleCallback(code, redirectUri, state);
            alert("Google Calendar connected successfully!");
            navigate('/scheduler', { replace: true });
        } catch (err) {
            console.error("Google Auth Error", err);
            const message =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                "Failed to connect Google Calendar";
            alert(message);
            navigate('/scheduler', { replace: true });
        } finally {
            setSyncing(false);
        }
        sessionStorage.removeItem(GOOGLE_STATE_KEY);
        sessionStorage.removeItem(GOOGLE_REDIRECT_URI_KEY);
    }, [navigate]);

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

    useEffect(() => {
        fetchData();

        // Handle Google OAuth Callback
        const params = new URLSearchParams(location.search);
        const oauthError = params.get('error');
        const oauthErrorDescription = params.get('error_description');
        const code = params.get('code');
        const state = params.get('state') || sessionStorage.getItem(GOOGLE_STATE_KEY);
        const storedRedirectUri = sessionStorage.getItem(GOOGLE_REDIRECT_URI_KEY);

        if (oauthError) {
            alert(`Google authorization failed: ${oauthErrorDescription || oauthError}`);
            sessionStorage.removeItem(GOOGLE_STATE_KEY);
            sessionStorage.removeItem(GOOGLE_REDIRECT_URI_KEY);
            navigate('/scheduler', { replace: true });
            return;
        }

        if (code && processedGoogleCodeRef.current !== code) {
            processedGoogleCodeRef.current = code;
            handleGoogleCallback(code, state, storedRedirectUri);
        }
    }, [location.search, handleGoogleCallback, navigate]);

    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false);
            const taskLabel = activeTask?.title ? ` for "${activeTask.title}"` : "";
            alert(`Focus session complete${taskLabel}!`);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft, activeTask]);

    const connectGoogleCalendar = async () => {
        try {
            const redirectUri = `${window.location.origin}/scheduler`;
            const data = await schedulerService.getGoogleAuthUrl(redirectUri);
            try {
                const authUrl = new URL(data.url);
                const state = authUrl.searchParams.get('state');
                if (state) {
                    sessionStorage.setItem(GOOGLE_STATE_KEY, state);
                }
                sessionStorage.setItem(GOOGLE_REDIRECT_URI_KEY, redirectUri);
            } catch (parseError) {
                console.warn("Failed to parse Google auth URL", parseError);
            }
            window.location.href = data.url;
        } catch (err) {
            console.error("Failed to get auth URL", err);
            const message =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                "Failed to initialize Google Calendar auth";
            alert(message);
        }
    };

    const selectTask = useCallback((task) => {
        setActiveTask(task);
        setTimerActive(false);
        setTimeLeft(getTaskTimerSeconds(task));
    }, []);

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

    const clearAllEvents = async () => {
        if (!window.confirm("Are you sure you want to delete ALL calendar events? You can re-schedule your roadmaps after.")) {
            return;
        }
        try {
            const result = await schedulerService.deleteAllEvents();
            setCalendarKey(prev => prev + 1); // Force calendar refresh
            alert(`Deleted ${result.deleted_count} events. Now re-schedule your roadmap to see tasks on the calendar.`);
        } catch (err) {
            console.error("Delete Error", err);
            alert("Failed to delete events.");
        }
    };

    const handleScheduleRoadmap = (roadmapId, roadmapTitle) => {
        setScheduleForm({ startDate: new Date().toISOString().split('T')[0], startTime: '09:00' });
        setScheduleModal({ roadmapId, roadmapTitle });
    };

    const confirmScheduleRoadmap = async () => {
        if (!scheduleModal) return;
        setScheduling(true);
        try {
            const result = await roadmapService.scheduleRoadmap(
                scheduleModal.roadmapId,
                scheduleForm.startDate,
                scheduleForm.startTime
            );
            setScheduleModal(null);
            fetchData();
            setCalendarKey(prev => prev + 1);
            const gcMsg = result.google_calendar_synced
                ? ' Events also added to Google Calendar!'
                : result.google_calendar_error
                    ? ' (Google Calendar sync skipped: not connected)':
                    '';
            alert(`Roadmap scheduled! ${result.events_created} tasks added to your calendar.${gcMsg}`);
        } catch (err) {
            console.error('Schedule error:', err);
            const message =
                err?.response?.data?.error ||
                err?.response?.data?.details ||
                'Failed to schedule roadmap';
            alert(message);
        } finally {
            setScheduling(false);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const toggleTimer = () => setTimerActive(!timerActive);
    const resetTimer = () => {
        setTimerActive(false);
        setTimeLeft(getTaskTimerSeconds(activeTask));
    };

    const handleEventClick = (event) => {
        // Navigate to tasks section
        if (event.task_id) {
            // Navigate to specific task if linked
            navigate(`/tasks?taskId=${event.task_id}`);
        } else {
            // Old events without task_id - navigate to tasks page anyway
            navigate('/tasks');
            alert('This is an old calendar event without a linked task. Delete all events and re-schedule your roadmap to fix this.');
        }
    };

    return (
        <>
        <div className="flex flex-col md:flex-row h-full bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-200">

            {/* Mobile Header with Menu Button */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-serif font-bold text-gray-900 dark:text-white">Schedule</h1>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                    <FaBars />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="md:hidden fixed top-0 left-0 bottom-0 w-full max-w-[320px] bg-white dark:bg-gray-800 z-50 overflow-y-auto shadow-2xl"
                        >
                            {/* Mobile Sidebar Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">My Tasks</h2>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Mobile Sidebar Content */}
                            <div className="p-4">
                                {/* Focus Timer Widget */}
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 rounded-2xl shadow-lg mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/70">Focus Mode</span>
                                        <FaClock className="text-white/70" />
                                    </div>
                                    <div className="text-4xl font-medium text-center mb-4 tracking-tight">
                                        {formatTime(timeLeft)}
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        <button onClick={toggleTimer} className="w-10 h-10 flex items-center justify-center bg-white text-indigo-600 rounded-full hover:bg-gray-100 transition-colors shadow-md">
                                            {timerActive ? <FaPause size={14} /> : <FaPlay size={14} className="ml-0.5" />}
                                        </button>
                                        <button onClick={resetTimer} className="w-10 h-10 flex items-center justify-center border border-white/30 rounded-full hover:bg-white/10 transition-colors">
                                            <FaRedo size={14} />
                                        </button>
                                    </div>
                                    {activeTask && (
                                        <div className="mt-3 text-xs text-center text-white/70 font-medium">
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
                                                <span className="truncate flex-1 mr-2 font-medium text-gray-700 dark:text-gray-300">{r.title}</span>
                                                <button
                                                    onClick={() => {
                                                        handleScheduleRoadmap(r.id);
                                                        setSidebarOpen(false);
                                                    }}
                                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded flex-shrink-0"
                                                >
                                                    Schedule
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Tasks List */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Tasks</h3>
                                    <div className="space-y-3">
                                        {tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                onClick={() => {
                                                    selectTask(task);
                                                    setSidebarOpen(false);
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{task.title}</h3>
                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-red-400' :
                                                        task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                                                        }`} />
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        🍅 {task.estimated_pomodoros}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {tasks.length === 0 && (
                                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No tasks available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar / Task List */}
            <div className="hidden md:flex w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col shadow-sm z-10">
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
                                        onClick={() => handleScheduleRoadmap(r.id, r.title)}
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
                                                    onClick={() => selectTask(task)}
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
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 min-w-0">
                <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-between items-center bg-white dark:bg-gray-800">
                    <h1 className="hidden md:block text-2xl font-serif font-bold text-gray-900 dark:text-white">Schedule</h1>

                    <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                        <button
                            onClick={connectGoogleCalendar}
                            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs md:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white transition-colors"
                        >
                            <FaGoogle className="text-red-500" />
                            <span className="hidden sm:inline">Connect Calendar</span>
                            <span className="sm:hidden">Connect</span>
                        </button>

                        <button
                            onClick={syncCalendar}
                            disabled={syncing}
                            className={`p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors ${syncing ? 'animate-spin' : ''}`}
                            title="Sync with Google Calendar"
                        >
                            <FaSync />
                        </button>

                        <button
                            onClick={clearAllEvents}
                            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Clear All Events"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-3 md:p-6 overflow-auto">
                    <WeeklyCalendar key={calendarKey} onEventClick={handleEventClick} />
                </div>
            </div>
        </div>

            {/* Schedule Roadmap Modal */}
            <AnimatePresence>
                {scheduleModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setScheduleModal(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Schedule Roadmap</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs">{scheduleModal.roadmapTitle}</p>
                                </div>
                                <button
                                    onClick={() => setScheduleModal(null)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        📅 Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={scheduleForm.startDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setScheduleForm(f => ({ ...f, startDate: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        🕐 Daily Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={scheduleForm.startTime}
                                        onChange={e => setScheduleForm(f => ({ ...f, startTime: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Tasks will be scheduled starting from this time each day.</p>
                                </div>

                                <div className="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                    <FaGoogle className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                        If Google Calendar is connected, tasks will also be added there automatically.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setScheduleModal(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmScheduleRoadmap}
                                    disabled={scheduling || !scheduleForm.startDate || !scheduleForm.startTime}
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    {scheduling ? (
                                        <><FaSync className="animate-spin" /> Scheduling...</>
                                    ) : (
                                        '📅 Schedule'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
