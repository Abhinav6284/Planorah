import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { schedulerService } from '../../../api/schedulerService';

const CalendarWidget = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await schedulerService.getEvents();
            setEvents((data || []).slice(0, 4)); // Show only upcoming 4 events
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            const data = await schedulerService.getGoogleAuthUrl();
            window.location.href = data.url;
        } catch (error) {
            console.error('Failed to get auth URL:', error);
        }
    };

    const formatEventTime = (startTime) => {
        if (!startTime) return '';
        const date = new Date(startTime);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let dateStr = '';
        if (date.toDateString() === today.toDateString()) {
            dateStr = 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            dateStr = 'Tomorrow';
        } else {
            dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        }

        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${dateStr} at ${timeStr}`;
    };

    const getEventColor = (index) => {
        const colors = [
            'bg-indigo-500',
            'bg-purple-500',
            'bg-emerald-500',
            'bg-amber-500'
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 h-full flex items-center justify-center border border-gray-100 dark:border-gray-800">
                <div className="text-gray-400 dark:text-gray-500 animate-pulse text-sm">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 h-full flex flex-col relative overflow-hidden border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Calendar</h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            {events.length > 0 ? `${events.length} events` : 'No events'}
                        </p>
                    </div>
                </div>
                <Link
                    to="/scheduler"
                    className="text-[10px] sm:text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    View All
                </Link>
            </div>

            {/* Events List */}
            {events.length > 0 ? (
                <div className="flex-1 space-y-3 overflow-hidden">
                    {events.map((event, index) => (
                        <div
                            key={event.id || index}
                            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            <div className={`w-1 h-full min-h-[40px] ${getEventColor(index)} rounded-full`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {event.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {formatEventTime(event.start_time)}
                                </p>
                            </div>
                            {event.is_completed && (
                                <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        No upcoming events
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                        Schedule a roadmap or connect Google Calendar
                    </p>
                    <button
                        onClick={handleConnect}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                        </svg>
                        Connect Google Calendar
                    </button>
                </div>
            )}

            {/* Quick Action */}
            {events.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Link
                        to="/scheduler"
                        className="flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Open Scheduler
                    </Link>
                </div>
            )}

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        </div>
    );
};

export default CalendarWidget;
