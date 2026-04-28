import React, { useState, useEffect, useCallback, useRef } from "react";
import { schedulerService } from "../../api/schedulerService";
import { roadmapService } from "../../api/roadmapService";
import { FaGoogle, FaSync, FaTrash, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import FullCalendar from "./FullCalendar";
import { AnimatePresence, motion } from "framer-motion";

const GOOGLE_STATE_KEY = "google_calendar_oauth_state";
const GOOGLE_REDIRECT_URI_KEY = "google_calendar_redirect_uri";

export default function Scheduler() {
    const [roadmaps, setRoadmaps] = useState([]);
    const [selectedRoadmap, setSelectedRoadmap] = useState("");
    const [syncing, setSyncing] = useState(false);
    const [calendarKey, setCalendarKey] = useState(0); // Force calendar refresh
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

    const fetchData = useCallback(async () => {
        try {
            const roadmapsData = await roadmapService.getUserRoadmaps();
            const roadmapList = Array.isArray(roadmapsData) ? roadmapsData : [];
            setRoadmaps(roadmapList);
            setSelectedRoadmap((prev) => {
                if (prev && roadmapList.some((r) => String(r.id) === String(prev))) {
                    return prev;
                }
                return roadmapList.length > 0 ? String(roadmapList[0].id) : "";
            });
        } catch (err) {
            console.error("Failed to fetch scheduler data", err);
        }
    }, []);

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
    }, [location.search, handleGoogleCallback, navigate, fetchData]);

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
                    ? ' (Google Calendar sync skipped: not connected)' :
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
            <div className="flex h-full min-h-full flex-col bg-gray-50 dark:bg-charcoalDark font-sans transition-colors duration-200">
                <div className="border-b border-gray-200 dark:border-charcoalMuted bg-white dark:bg-charcoal px-4 py-4 md:px-8 md:py-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-xl font-serif font-bold text-gray-900 dark:text-white md:text-2xl">Schedule</h1>

                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            {roadmaps.length > 0 && (
                                <>
                                    <select
                                        value={selectedRoadmap}
                                        onChange={(e) => setSelectedRoadmap(e.target.value)}
                                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 dark:border-charcoalMuted dark:bg-charcoalMuted dark:text-white md:text-sm"
                                    >
                                        {roadmaps.map((roadmap) => (
                                            <option key={roadmap.id} value={String(roadmap.id)}>
                                                {roadmap.title}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            const roadmap = roadmaps.find((r) => String(r.id) === String(selectedRoadmap));
                                            if (roadmap) {
                                                handleScheduleRoadmap(roadmap.id, roadmap.title);
                                            }
                                        }}
                                        className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 md:text-sm"
                                    >
                                        Schedule Roadmap
                                    </button>
                                </>
                            )}

                            <button
                                onClick={connectGoogleCalendar}
                                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-charcoalMuted dark:bg-charcoalMuted dark:text-white dark:hover:bg-charcoalMuted md:px-4 md:text-sm"
                            >
                                <FaGoogle className="text-red-500" />
                                <span className="hidden sm:inline">Connect Calendar</span>
                                <span className="sm:hidden">Connect</span>
                            </button>

                            <button
                                onClick={syncCalendar}
                                disabled={syncing}
                                className={`rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-charcoalMuted dark:hover:text-white ${syncing ? 'animate-spin' : ''}`}
                                title="Sync with Google Calendar"
                            >
                                <FaSync />
                            </button>

                            <button
                                onClick={clearAllEvents}
                                className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                title="Clear All Events"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-3 md:p-6">
                    <FullCalendar key={calendarKey} onEventClick={handleEventClick} />
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
                            className="bg-white dark:bg-charcoal rounded-2xl shadow-2xl w-full max-w-md p-6"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Schedule Roadmap</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs">{scheduleModal.roadmapTitle}</p>
                                </div>
                                <button
                                    onClick={() => setScheduleModal(null)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-charcoalMuted text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-charcoalMuted bg-gray-50 dark:bg-charcoalMuted text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-charcoalMuted bg-gray-50 dark:bg-charcoalMuted text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-charcoalMuted text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-charcoalMuted font-medium text-sm transition-colors"
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
