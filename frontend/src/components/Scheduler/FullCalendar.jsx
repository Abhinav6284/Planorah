import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { schedulerService } from "../../api/schedulerService";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./FullCalendar.css";

const locales = {
    "en-US": enUS,
};

const getStartOfWeek = (date, culture) =>
    startOfWeek(date, {
        locale: locales[culture] || enUS,
        weekStartsOn: 1,
    });

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: getStartOfWeek,
    getDay,
    locales,
});

const calendarMessages = {
    today: "Today",
    previous: "Back",
    next: "Next",
    month: "Month",
    week: "Week",
    day: "Day",
    agenda: "Agenda",
    date: "Date",
    time: "Time",
    event: "Event",
    noEventsInRange: "No events in this range.",
};

const palette = ["#4f46e5", "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

const getColorById = (idLike) => {
    const source = String(idLike || "calendar-event");
    const sum = source.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return palette[sum % palette.length];
};

const normalizeEvents = (payload) => {
    const source = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.events) ? payload.events : []);

    return source
        .map((item) => {
            const start = new Date(item.start_time || item.start);
            const end = new Date(item.end_time || item.end);

            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                return null;
            }

            return {
                id: item.id,
                title: item.title || "Untitled event",
                start,
                end,
                resource: item,
            };
        })
        .filter(Boolean);
};

const CalendarToolbar = ({ label, onNavigate, onView, view, views }) => (
    <div className="rbc-custom-toolbar">
        <div className="rbc-toolbar-nav">
            <button type="button" onClick={() => onNavigate("PREV")}>←</button>
            <button type="button" onClick={() => onNavigate("TODAY")}>Today</button>
            <button type="button" onClick={() => onNavigate("NEXT")}>→</button>
        </div>

        <div className="rbc-toolbar-label">{label}</div>

        <div className="rbc-toolbar-views">
            {views.map((currentView) => (
                <button
                    key={currentView}
                    type="button"
                    onClick={() => onView(currentView)}
                    className={view === currentView ? "active" : ""}
                >
                    {calendarMessages[currentView] || currentView}
                </button>
            ))}
        </div>
    </div>
);

const FullCalendar = ({ onEventClick }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const payload = await schedulerService.getEvents();
            setEvents(normalizeEvents(payload));
        } catch (error) {
            console.error("Failed to fetch events", error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const eventPropGetter = useCallback((event) => {
        const color = getColorById(event?.resource?.id || event?.id || event?.title);
        return {
            style: {
                backgroundColor: color,
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                boxShadow: "0 8px 18px -12px rgba(0, 0, 0, 0.45)",
                fontWeight: 600,
                fontSize: "12px",
            },
        };
    }, []);

    const minTime = useMemo(() => new Date(1970, 1, 1, 6, 0, 0), []);
    const maxTime = useMemo(() => new Date(1970, 1, 1, 23, 0, 0), []);

    return (
        <div className="scheduler-full-calendar h-full min-h-[680px] rounded-2xl border border-gray-200 bg-white p-3 dark:border-charcoalMuted dark:bg-[#111318] md:p-4">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                popup
                step={30}
                timeslots={2}
                min={minTime}
                max={maxTime}
                eventPropGetter={eventPropGetter}
                onSelectEvent={(event) => onEventClick?.(event.resource || event)}
                components={{ toolbar: CalendarToolbar }}
                messages={calendarMessages}
            />

            {loading && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 text-sm font-medium text-gray-600 dark:bg-[#111318]/70 dark:text-gray-300">
                    Loading calendar...
                </div>
            )}
        </div>
    );
};

export default FullCalendar;
