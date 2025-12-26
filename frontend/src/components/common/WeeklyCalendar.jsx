import React, { useState, useEffect, useMemo } from 'react';
import { schedulerService } from '../../api/schedulerService';

const WeeklyCalendar = ({ compact = false, onEventClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Time slots from 6am to 10pm
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let hour = 6; hour <= 22; hour++) {
            const ampm = hour >= 12 ? 'pm' : 'am';
            const displayHour = hour > 12 ? hour - 12 : hour;
            slots.push({ hour, label: `${displayHour}:00 ${ampm}` });
        }
        return slots;
    }, []);

    // Compact mode shows fewer time slots
    const displayedTimeSlots = compact
        ? timeSlots.filter(s => s.hour >= 8 && s.hour <= 18)
        : timeSlots;

    // Generate week days
    const weekDays = useMemo(() => {
        const days = [];
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = startOfWeek.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Start from Monday
        startOfWeek.setDate(startOfWeek.getDate() + diff);

        for (let i = 0; i < 6; i++) { // Mon-Sat
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push({
                date: day,
                dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNumber: day.getDate(),
                isToday: day.toDateString() === new Date().toDateString()
            });
        }
        return days;
    }, [currentDate]);

    // Current month name
    const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Previous and next month names
    const prevMonth = useMemo(() => {
        const prev = new Date(currentDate);
        prev.setMonth(prev.getMonth() - 1);
        return prev.toLocaleDateString('en-US', { month: 'long' });
    }, [currentDate]);

    const nextMonth = useMemo(() => {
        const next = new Date(currentDate);
        next.setMonth(next.getMonth() + 1);
        return next.toLocaleDateString('en-US', { month: 'long' });
    }, [currentDate]);

    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const data = await schedulerService.getEvents();
            const formattedEvents = data.map(e => ({
                ...e,
                start: new Date(e.start_time),
                end: new Date(e.end_time),
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error('Failed to fetch events', err);
        } finally {
            setLoading(false);
        }
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    // Get events for a specific day
    const getEventsForDay = (day) => {
        return events.filter(event => {
            return event.start.toDateString() === day.date.toDateString();
        });
    };

    // Calculate event position based on time
    const getEventStyle = (event, dayIndex) => {
        const startHour = event.start.getHours() + event.start.getMinutes() / 60;
        const endHour = event.end.getHours() + event.end.getMinutes() / 60;
        const duration = endHour - startHour;

        const firstSlotHour = displayedTimeSlots[0]?.hour || 6;
        const slotHeight = compact ? 40 : 60; // pixels per hour

        const top = (startHour - firstSlotHour) * slotHeight;
        const height = Math.max(duration * slotHeight, 40); // Minimum height

        return {
            top: `${top}px`,
            height: `${height}px`,
            left: `${(dayIndex / 6) * 100}%`,
            width: `${100 / 6 - 2}%`,
        };
    };

    // Event colors
    const eventColors = [
        { bg: 'bg-gray-900 dark:bg-white', text: 'text-white dark:text-gray-900' },
        { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-900 dark:text-purple-200' },
        { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-900 dark:text-blue-200' },
    ];

    return (
        <div className={`bg-gray-900 rounded-[30px] ${compact ? 'p-4' : 'p-6'} h-full relative overflow-hidden transition-colors`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigateMonth(-1)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs font-medium text-gray-400 transition-colors"
                >
                    {prevMonth}
                </button>
                <h3 className="text-white font-serif text-lg font-medium">{currentMonth}</h3>
                <button
                    onClick={() => navigateMonth(1)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs font-medium text-gray-400 transition-colors"
                >
                    {nextMonth}
                </button>
            </div>

            {/* Week Navigation */}
            {!compact && (
                <div className="flex justify-center gap-2 mb-4">
                    <button
                        onClick={() => navigateWeek(-1)}
                        className="px-3 py-1 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        ← Prev Week
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => navigateWeek(1)}
                        className="px-3 py-1 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        Next Week →
                    </button>
                </div>
            )}

            {/* Calendar Grid */}
            <div className="flex h-[calc(100%-80px)]">
                {/* Time Column */}
                <div className={`flex flex-col pr-2 ${compact ? 'pt-8' : 'pt-10'}`}>
                    {displayedTimeSlots.map((slot, i) => (
                        <div
                            key={i}
                            className={`text-[10px] text-gray-500 font-medium ${compact ? 'h-10' : 'h-[60px]'}`}
                        >
                            {slot.label}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="flex-1 relative">
                    {/* Day Headers */}
                    <div className="grid grid-cols-6 mb-2">
                        {weekDays.map((day, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-xs text-gray-500 mb-1">{day.dayName}</span>
                                <span className={`text-sm font-bold ${day.isToday ? 'text-white' : 'text-gray-400'}`}>
                                    {day.dayNumber}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Grid Lines */}
                    <div className="absolute inset-0 top-10 grid grid-cols-6">
                        {weekDays.map((_, i) => (
                            <div
                                key={i}
                                className="border-l border-dashed border-gray-700 first:border-l-0"
                            />
                        ))}
                    </div>

                    {/* Time Grid Lines */}
                    <div className="absolute inset-0 top-10">
                        {displayedTimeSlots.map((_, i) => (
                            <div
                                key={i}
                                className={`border-t border-dashed border-gray-800 ${compact ? 'h-10' : 'h-[60px]'}`}
                            />
                        ))}
                    </div>

                    {/* Events Layer */}
                    <div className="absolute inset-0 top-10 pointer-events-none">
                        {weekDays.map((day, dayIndex) => (
                            getEventsForDay(day).map((event, eventIndex) => {
                                const colorIndex = eventIndex % eventColors.length;
                                const color = eventColors[colorIndex];
                                const style = getEventStyle(event, dayIndex);

                                return (
                                    <div
                                        key={event.id}
                                        style={style}
                                        onClick={() => onEventClick?.(event)}
                                        className={`absolute ${color.bg} ${color.text} p-2 rounded-xl shadow-lg z-10 pointer-events-auto cursor-pointer hover:scale-[1.02] transition-transform mx-1`}
                                    >
                                        <div className={`font-bold ${compact ? 'text-[10px]' : 'text-xs'} mb-0.5 truncate`}>
                                            {event.title}
                                        </div>
                                        {!compact && event.description && (
                                            <div className="text-[10px] opacity-70 truncate">
                                                {event.description}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-20">
                            <div className="text-gray-400 text-sm animate-pulse">Loading events...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeeklyCalendar;
