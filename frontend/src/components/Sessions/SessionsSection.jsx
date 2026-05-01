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
    const { submitRequest, isSubmitting, error } = useSessionsStore();
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: 16 }}>
            <div style={{ width: '100%', maxWidth: 440, background: 'var(--el-bg)', border: '1px solid var(--el-border)', borderRadius: 16, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <div style={{ fontSize: 32, marginBottom: 16 }}>✅</div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--el-text)', marginBottom: 8 }}>Request Received</p>
                        <p style={{ fontSize: 14, color: 'var(--el-text-muted)' }}>We'll confirm your session within 12 hours.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--el-text)', letterSpacing: '-0.02em' }}>Request Mentor Session</h3>
                                <p style={{ fontSize: 13, color: 'var(--el-text-muted)', marginTop: 4 }}>Get 1:1 guidance from our experts.</p>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--el-text-muted)' }}>
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--el-text-muted)', marginBottom: 12 }}>Focus Topics</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {TOPIC_OPTIONS.map((opt) => {
                                    const active = selectedTags.includes(opt.value);
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => toggleTag(opt.value)}
                                            style={{
                                                padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                border: '1px solid var(--el-border)', cursor: 'pointer', transition: 'all 0.1s',
                                                background: active ? 'var(--el-text)' : 'var(--el-bg-secondary)',
                                                color: active ? 'var(--el-bg)' : 'var(--el-text-secondary)',
                                                borderColor: active ? 'var(--el-text)' : 'var(--el-border)'
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--el-text-muted)', marginBottom: 12 }}>Description</p>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what you'd like to discuss..."
                                style={{
                                    width: '100%', borderRadius: 12, border: '1px solid var(--el-border)', 
                                    background: 'var(--el-bg-secondary)', color: 'var(--el-text)', padding: 16, 
                                    fontSize: 14, minHeight: 100, resize: 'none', outline: 'none'
                                }}
                            />
                        </div>

                        {error && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 16, fontWeight: 600 }}>{error}</p>}

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={onClose}
                                style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: 'var(--el-bg)', border: '1px solid var(--el-border)', color: 'var(--el-text-secondary)', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: 'var(--el-text)', color: 'var(--el-bg)', border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.6 : 1 }}
                            >
                                {isSubmitting ? 'Sending…' : 'Send Request'}
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
        <div style={{ 
            background: 'var(--el-bg)', 
            border: '1px solid var(--el-border)', 
            borderRadius: 16, 
            padding: 24, 
            boxShadow: 'var(--el-shadow-card)',
            color: 'var(--el-text)'
        }}>
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', 
                        borderRadius: 12, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)',
                        marginBottom: 20
                    }}
                >
                    <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--el-text)' }}>{notif.message}</p>
                    <button
                        onClick={() => markNotificationRead(notif.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--el-text-muted)' }}
                    >
                        <X style={{ width: 14, height: 14 }} />
                    </button>
                </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Calendar style={{ width: 16, height: 16, color: 'var(--el-text)' }} />
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--el-text)' }}>1:1 Mentoring</h3>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--el-text-muted)' }}>
                        {remaining.limit === 0
                            ? 'Upgrade plan for mentoring'
                            : `${remaining.remaining} sessions left this month`}
                    </p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    disabled={!canRequest}
                    style={{
                        padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                        background: 'var(--el-text)', color: 'var(--el-bg)', border: 'none',
                        cursor: 'pointer', opacity: !canRequest ? 0.4 : 1
                    }}
                >
                    Request
                </button>
            </div>

            {isLoading ? (
                <p style={{ textAlign: 'center', padding: '12px 0', fontSize: 13, color: 'var(--el-text-muted)' }}>Loading sessions...</p>
            ) : sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', borderRadius: 12, background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border-subtle)' }}>
                    <p style={{ fontSize: 13, color: 'var(--el-text-muted)' }}>No sessions requested yet.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {visibleSessions.map((session) => {
                            const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.requested;
                            const isConfirmed = session.status === 'confirmed';
                            return (
                                <div
                                    key={session.id}
                                    style={{ 
                                        padding: 16, borderRadius: 12, border: '1px solid var(--el-border-subtle)',
                                        background: 'var(--el-bg)', display: 'flex', justifyContent: 'space-between', gap: 12
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                            {session.topic_tags?.map(tag => (
                                                <span key={tag} style={{ 
                                                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', 
                                                    padding: '2px 8px', borderRadius: 4, background: 'var(--el-bg-secondary)', color: 'var(--el-text-muted)' 
                                                }}>{tag}</span>
                                            ))}
                                        </div>
                                        {session.description && (
                                            <p style={{ fontSize: 13, color: 'var(--el-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.description}</p>
                                        )}
                                        {isConfirmed && session.scheduled_at && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--el-text-muted)', fontWeight: 600 }}>
                                                    <Clock style={{ width: 12, height: 12 }} />
                                                    {new Date(session.scheduled_at).toLocaleDateString()}
                                                </div>
                                                {session.meeting_link && (
                                                    <a href={session.meeting_link} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--el-text)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Video style={{ width: 12, height: 12 }} />
                                                        Join
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ 
                                        height: 'fit-content', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                        background: session.status === 'confirmed' ? '#dcfce7' : 'var(--el-bg-secondary)',
                                        color: session.status === 'confirmed' ? '#166534' : 'var(--el-text-secondary)'
                                    }}>
                                        {cfg.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {sessions.length > 3 && (
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            style={{ 
                                marginTop: 16, width: '100%', background: 'none', border: 'none', 
                                cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--el-text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                            }}
                        >
                            {expanded ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                            {expanded ? 'Show less' : `Show ${sessions.length - 3} more`}
                        </button>
                    )}
                </>
            )}

            {modalOpen && <RequestModal onClose={() => { setModalOpen(false); useSessionsStore.getState().clearError(); }} />}
        </div>
    );
}
