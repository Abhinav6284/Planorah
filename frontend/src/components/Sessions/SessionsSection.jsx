import { useEffect, useState } from 'react';
import { Calendar, Clock, Video, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useSessionsStore } from '../../stores/sessionsStore';

const TOPIC_OPTIONS = [
    { value: 'roadmap', label: 'Roadmap' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'career', label: 'Career Advice' },
    { value: 'resume', label: 'Resume Help' },
    { value: 'problem', label: 'Problem / Blocker' },
    { value: 'other', label: 'Other' },
];

const STATUS_CONFIG = {
    requested: { label: 'Requested', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

function RequestModal({ onClose }) {
    const { submitRequest, isSubmitting, error, clearError } = useSessionsStore();
    const [selectedTags, setSelectedTags] = useState([]);
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const toggleTag = (value) => {
        setSelectedTags((prev) =>
            prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
        );
    };

    const handleSubmit = async () => {
        const result = await submitRequest(selectedTags, description);
        if (result.success) {
            setSubmitted(true);
            setTimeout(onClose, 1500);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1a1a1a] p-6 shadow-xl mx-4">
                {submitted ? (
                    <div className="text-center py-4">
                        <div className="text-4xl mb-3">✅</div>
                        <p className="text-gray-800 dark:text-white font-semibold">Request sent! We'll get back to you within 12 hours.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request a 1:1 Session</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Select a topic and optionally describe what you'd like to discuss. We'll confirm a time within 12 hours.
                        </p>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic (optional)</p>
                            <div className="flex flex-wrap gap-2">
                                {TOPIC_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => toggleTag(opt.value)}
                                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                            selectedTags.includes(opt.value)
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-400'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (optional)</p>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what you'd like to discuss..."
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] text-gray-800 dark:text-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                rows={3}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 mb-3">{error}</p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm font-medium transition-colors disabled:opacity-60"
                            >
                                {isSubmitting ? 'Sending…' : 'Request Session'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function SessionsSection() {
    const { sessions, remaining, notifications, isLoading, fetchSessions, markNotificationRead } = useSessionsStore();
    const [modalOpen, setModalOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const canRequest = remaining.remaining > 0;
    const visibleSessions = expanded ? sessions : sessions.slice(0, 3);

    return (
        <div className="rounded-2xl border-0 bg-white dark:bg-[#1a1a1a] p-6 shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className="flex items-start justify-between gap-3 mb-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 p-3"
                >
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">{notif.message}</p>
                    <button
                        onClick={() => markNotificationRead(notif.id)}
                        className="text-indigo-400 hover:text-indigo-600 shrink-0"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-500" />
                        1:1 Mentor Sessions
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {remaining.limit === 0
                            ? 'Upgrade to Pro or Elite to access sessions'
                            : `${remaining.remaining} of ${remaining.limit} sessions remaining this month`}
                    </p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    disabled={!canRequest}
                    title={!canRequest ? (remaining.limit === 0 ? 'Upgrade your plan to book sessions' : 'Monthly session limit reached') : undefined}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white px-4 py-2 text-sm font-medium transition-colors"
                >
                    Request Session
                </button>
            </div>

            {isLoading ? (
                <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
            ) : sessions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No sessions yet. Request your first one!</p>
            ) : (
                <>
                    <div className="space-y-3">
                        {visibleSessions.map((session) => {
                            const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.requested;
                            return (
                                <div
                                    key={session.id}
                                    className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-start justify-between gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {session.topic_tags && session.topic_tags.length > 0 ? (
                                                session.topic_tags.map((tag) => (
                                                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                        {tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400">No topic</span>
                                            )}
                                        </div>
                                        {session.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{session.description}</p>
                                        )}
                                        {session.status === 'confirmed' && session.scheduled_at && (
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(session.scheduled_at).toLocaleString()}
                                                </span>
                                                {session.meeting_link && (
                                                    <a
                                                        href={session.meeting_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                                                    >
                                                        <Video size={12} />
                                                        Join Session
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${cfg.color}`}>
                                        {cfg.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {sessions.length > 3 && (
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            {expanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show {sessions.length - 3} more</>}
                        </button>
                    )}
                </>
            )}

            {modalOpen && <RequestModal onClose={() => { setModalOpen(false); useSessionsStore.getState().clearError(); }} />}
        </div>
    );
}
