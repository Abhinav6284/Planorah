import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SchedulerSection() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/scheduler/events/")
            .then((res) => setEvents(res.data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
            <div className="bg-white rounded-lg shadow p-4">
                {events.length === 0 ? (
                    <p>No scheduled events yet.</p>
                ) : (
                    <ul>
                        {events.map((e) => (
                            <li key={e.id} className="border-b py-2">
                                <strong>{e.title}</strong> — {new Date(e.start_time).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
