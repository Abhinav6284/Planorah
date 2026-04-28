import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import AITalkPanel from './Mentoring/AITalkPanel';
import AIVoicePanel from './Mentoring/AIVoicePanel';
import WelcomeCoach from './Onboarding/WelcomeCoach';
import { TourProvider } from './Tour/TourContext';
import GuidedTour from './Tour/GuidedTour';
import Sidebar from './Sidebar';
import { Menu, MessageSquare, Mic, X, Bell, Search, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '../api/userService';
import { getUserAvatar } from '../utils/avatar';
import { assistantPipelineService } from '../api/assistantPipelineService';
import { useTheme } from '../context/ThemeContext';


const REALTIME_ONBOARDING_INTRO_KEY = 'show_realtime_onboarding_intro';

const getContextSource = (pathname) => {
    if (pathname.startsWith('/roadmap')) return 'roadmap';
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/tasks')) return 'tasks';
    if (pathname.startsWith('/scheduler')) return 'scheduler';
    if (pathname.startsWith('/resume')) return 'resume';
    if (pathname.startsWith('/lab')) return 'lab';
    if (pathname.startsWith('/ats')) return 'ats';
    if (pathname.startsWith('/jobs')) return 'jobs';
    if (pathname.startsWith('/interview')) return 'interview';
    if (pathname.startsWith('/portfolio')) return 'portfolio';
    if (pathname.startsWith('/projects')) return 'projects';
    if (pathname.startsWith('/planora')) return 'planora';
    if (pathname.startsWith('/assistant')) return 'assistant';
    return 'general';
};

const getPageTitle = (pathname) => {
    if (pathname.startsWith('/dashboard')) return 'Home';
    if (pathname.startsWith('/roadmap/projects')) return 'My Projects';
    if (pathname.startsWith('/roadmap/list')) return 'Learning Path';
    if (pathname.startsWith('/roadmap')) return 'Roadmap';
    if (pathname.startsWith('/tasks')) return 'Tasks';
    if (pathname.startsWith('/scheduler')) return 'Calendar';
    if (pathname.startsWith('/resume/compiled')) return 'Compiled Resumes';
    if (pathname.startsWith('/resume')) return 'Resume Builder';
    if (pathname.startsWith('/lab')) return 'Virtual Lab';
    if (pathname.startsWith('/ats')) return 'Find Your Fit';
    if (pathname.startsWith('/jobs')) return 'Job Finder';
    if (pathname.startsWith('/interview')) return 'Mock Interview';
    if (pathname.startsWith('/portfolio')) return 'Portfolio';
    if (pathname.startsWith('/planora')) return 'Study Platform';
    if (pathname.startsWith('/subscription/plans')) return 'Pricing';
    if (pathname.startsWith('/subscription')) return 'Subscription';
    if (pathname.startsWith('/billing')) return 'Billing History';
    if (pathname.startsWith('/profile')) return 'Settings';
    if (pathname.startsWith('/assistant')) return 'Assistant';
    return 'Planorah';
};

const Layout = () => {
    const { theme, toggleTheme } = useTheme();
    const [chatOpen, setChatOpen] = useState(false);
    const [voiceOpen, setVoiceOpen] = useState(false);
    const [launcherExpanded, setLauncherExpanded] = useState(false);
    const [welcomeUser, setWelcomeUser] = useState(null);
    const [autoVoiceStart, setAutoVoiceStart] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [user, setUser] = useState(null);
    const [quickySuggestion, setQuickySuggestion] = useState(null);
    const [quickyLoading, setQuickyLoading] = useState(false);
    const [bubbleDismissed, setBubbleDismissed] = useState(false);
    const prevContextRef = useRef(null);
    const location = useLocation();
    const contextSource = getContextSource(location.pathname);
    const pageTitle = getPageTitle(location.pathname);

    useEffect(() => {
        const shouldAutoStartRealtimeIntro =
            sessionStorage.getItem(REALTIME_ONBOARDING_INTRO_KEY) === 'true';

        if (shouldAutoStartRealtimeIntro && location.pathname.startsWith('/dashboard')) {
            sessionStorage.removeItem(REALTIME_ONBOARDING_INTRO_KEY);
            sessionStorage.removeItem('show_welcome_coach');
            setWelcomeUser(null);
            setAutoVoiceStart(true);
            setVoiceOpen(true);
            return;
        }

        if (shouldAutoStartRealtimeIntro) return;

        const flag = sessionStorage.getItem('show_welcome_coach');
        if (flag) {
            setWelcomeUser(flag === 'true' ? '' : flag);
        }
    }, [location.pathname]);

    useEffect(() => {
        userService.getProfile()
            .then(profileData => setUser(profileData))
            .catch(() => setUser(null));
    }, []);

    useEffect(() => {
        if (prevContextRef.current === contextSource) return;
        prevContextRef.current = contextSource;
        setBubbleDismissed(false);
        setQuickySuggestion(null);
        setQuickyLoading(true);
        let cancelled = false;
        assistantPipelineService.getSuggestions(contextSource)
            .then((suggestions) => {
                if (!cancelled && suggestions.length > 0) {
                    setQuickySuggestion(suggestions[0].text);
                }
            })
            .catch(() => { })
            .finally(() => { if (!cancelled) setQuickyLoading(false); });
        return () => { cancelled = true; };
    }, [contextSource]);

    const userAvatar = user ? getUserAvatar(user) : '';
    const userName = user?.first_name || user?.profile?.first_name || 'User';

    const handleOpenVoice = () => {
        setChatOpen(false);
        setVoiceOpen(true);
        setLauncherExpanded(false);
    };

    const handleOpenChat = () => {
        setVoiceOpen(false);
        setAutoVoiceStart(false);
        setChatOpen(true);
        setLauncherExpanded(false);
    };

    return (
        <TourProvider>
            {/* ── ElevenLabs shell: sidebar + main ── */}
            <div style={{
                display: 'flex',
                minHeight: '100vh',
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                background: 'var(--el-bg)',
                color: 'var(--el-text)',
            }}>
                {/* Sidebar */}
                <Sidebar
                    mobileOpen={mobileMenuOpen}
                    onMobileClose={() => setMobileMenuOpen(false)}
                    user={user}
                />

                {/* Main content area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {/* ── Top Header Bar (ElevenLabs style) ── */}
                    <header style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 24px',
                        height: 52,
                        background: 'var(--el-bg)',
                        borderBottom: '1px solid var(--el-border-subtle)',
                    }}>
                        {/* Left: hamburger + page title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 36, height: 36,
                                    borderRadius: 8,
                                    background: 'transparent',
                                    border: '1px solid var(--el-border)',
                                    cursor: 'pointer',
                                    color: 'var(--el-text)',
                                }}
                            >
                                <Menu style={{ width: 18, height: 18 }} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: 'var(--el-text)',
                                    letterSpacing: '0.01em',
                                }}>
                                    {pageTitle}
                                </span>
                            </div>
                        </div>

                        {/* Right: action pills */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Theme Toggle */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 34, height: 34,
                                    borderRadius: 9999,
                                    border: '1px solid var(--el-border)',
                                    background: 'var(--el-bg)',
                                    cursor: 'pointer',
                                    color: 'var(--el-text-secondary)',
                                    transition: 'all 0.15s',
                                    boxShadow: 'var(--el-shadow-inset)',
                                    marginRight: 4,
                                }}
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--el-bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--el-bg)'}
                            >
                                {theme === 'dark' ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
                            </button>

                            {/* Action pills — hidden on small screens */}
                            <div className="hidden md:flex" style={{ alignItems: 'center', gap: 6 }}>
                                {[
                                    { label: "What's new", icon: null },
                                    { label: 'Feedback', icon: null },
                                    { label: 'Docs', icon: null },
                                ].map((pill) => (
                                    <button
                                        key={pill.label}
                                        type="button"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '5px 12px',
                                            borderRadius: 9999,
                                            border: '1px solid var(--el-border)',
                                            background: 'var(--el-bg)',
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: 'var(--el-text)',
                                            cursor: 'pointer',
                                            fontFamily: "'Inter', sans-serif",
                                            letterSpacing: '0.01em',
                                            transition: 'all 0.15s',
                                            boxShadow: 'var(--el-shadow-inset)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--el-bg-secondary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--el-bg)';
                                        }}
                                    >
                                        {pill.label}
                                    </button>
                                ))}

                                {/* Ask button — opens assistant */}
                                <button
                                    type="button"
                                    onClick={handleOpenChat}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '5px 12px',
                                        borderRadius: 9999,
                                        border: '1px solid var(--el-border)',
                                        background: 'var(--el-bg)',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: 'var(--el-text)',
                                        cursor: 'pointer',
                                        fontFamily: "'Inter', sans-serif",
                                        letterSpacing: '0.01em',
                                        transition: 'all 0.15s',
                                        boxShadow: 'var(--el-shadow-inset)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--el-bg-secondary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--el-bg)'}
                                >
                                    <Search style={{ width: 13, height: 13, opacity: 0.5 }} />
                                    Ask
                                </button>
                            </div>

                            {/* Bell icon */}
                            <button
                                type="button"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 34, height: 34,
                                    borderRadius: 9999,
                                    border: '1px solid var(--el-border)',
                                    background: 'var(--el-bg)',
                                    cursor: 'pointer',
                                    color: 'var(--el-text-secondary)',
                                    transition: 'all 0.15s',
                                    boxShadow: 'var(--el-shadow-inset)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--el-bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--el-bg)'}
                            >
                                <Bell style={{ width: 15, height: 15 }} />
                            </button>

                            {/* User avatar */}
                            <Link to="/settings">
                                <div style={{
                                    width: 32, height: 32,
                                    borderRadius: 9999,
                                    overflow: 'hidden',
                                    border: '1px solid var(--el-border)',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.15s',
                                    boxShadow: 'var(--el-shadow-inset)',
                                }}>
                                    {userAvatar ? (
                                        <img
                                            src={userAvatar}
                                            alt="Profile"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%', height: '100%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'var(--el-bg-secondary)',
                                            fontSize: 13, fontWeight: 600, color: 'var(--el-text-secondary)',
                                        }}>
                                            {userName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </div>
                    </header>

                    {/* Content */}
                    <main style={{ flex: 1, overflow: 'auto', background: 'var(--el-bg)' }}>
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* ── Floating Quicky dock ── */}
            <AnimatePresence>
                {!chatOpen && !voiceOpen && (
                    launcherExpanded ? (
                        <motion.div
                            key="quicky-expanded"
                            initial={{ opacity: 0, y: 14, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                            style={{
                                position: 'fixed',
                                bottom: 20,
                                right: 20,
                                zIndex: 50,
                                width: 'min(94vw, 320px)',
                                borderRadius: 16,
                                border: '1px solid var(--el-border)',
                                background: 'var(--el-bg)',
                                padding: 12,
                                boxShadow: 'var(--el-shadow-card)',
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderRadius: 10,
                                border: '1px solid var(--el-border-subtle)',
                                background: 'var(--el-bg-secondary)',
                                padding: '8px 12px',
                                marginBottom: 12,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18 }} aria-hidden="true">🦉</span>
                                    <div style={{ lineHeight: 1.3 }}>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--el-text)', margin: 0 }}>Quicky Assistant</p>
                                        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--el-text-muted)', margin: 0 }}>Message or voice</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setLauncherExpanded(false)}
                                    style={{
                                        width: 28, height: 28,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: 8,
                                        border: '1px solid var(--el-border)',
                                        background: 'var(--el-bg)',
                                        cursor: 'pointer',
                                        color: 'var(--el-text-secondary)',
                                    }}
                                    aria-label="Minimize Quicky"
                                >
                                    <X style={{ width: 14, height: 14 }} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={handleOpenChat}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        border: '1px solid var(--el-border)',
                                        background: 'var(--el-bg)',
                                        fontSize: 14, fontWeight: 500,
                                        color: 'var(--el-text)',
                                        cursor: 'pointer',
                                        fontFamily: "'Inter', sans-serif",
                                        transition: 'background 0.15s',
                                        boxShadow: 'var(--el-shadow-inset)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--el-bg-secondary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--el-bg)'}
                                >
                                    <MessageSquare style={{ width: 16, height: 16 }} />
                                    Text
                                </button>

                                <button
                                    type="button"
                                    onClick={handleOpenVoice}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        border: 'none',
                                        background: 'var(--el-text)',
                                        fontSize: 14, fontWeight: 500,
                                        color: 'var(--el-bg)',
                                        cursor: 'pointer',
                                        fontFamily: "'Inter', sans-serif",
                                        transition: 'opacity 0.15s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                    <Mic style={{ width: 16, height: 16 }} />
                                    Voice
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div key="quicky-collapsed" style={{
                            position: 'fixed',
                            bottom: 20,
                            right: 20,
                            zIndex: 50,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: 8,
                        }}>
                            {/* Suggestion bubble */}
                            <AnimatePresence>
                                {!bubbleDismissed && (quickyLoading || quickySuggestion) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.92 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.92 }}
                                        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                                        style={{
                                            position: 'relative',
                                            maxWidth: 240,
                                            borderRadius: 14,
                                            border: '1px solid var(--el-border)',
                                            background: 'var(--el-bg)',
                                            boxShadow: 'var(--el-shadow-card)',
                                            padding: '10px 14px',
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setBubbleDismissed(true)}
                                            style={{
                                                position: 'absolute',
                                                top: -8, right: -8,
                                                width: 20, height: 20,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                borderRadius: 9999,
                                                background: 'var(--el-bg)',
                                                border: '1px solid var(--el-border)',
                                                cursor: 'pointer',
                                                color: 'var(--el-text-secondary)',
                                            }}
                                            aria-label="Dismiss"
                                        >
                                            <X style={{ width: 10, height: 10 }} />
                                        </button>

                                        {quickyLoading ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
                                                <span style={{ fontSize: 14 }}>🦉</span>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    {[0, 160, 320].map((delay) => (
                                                        <span
                                                            key={delay}
                                                            className="animate-bounce"
                                                            style={{
                                                                width: 5, height: 5,
                                                                borderRadius: 9999,
                                                                background: 'var(--el-text)',
                                                                animationDelay: `${delay}ms`,
                                                                animationDuration: '900ms',
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleOpenChat}
                                                style={{
                                                    textAlign: 'left',
                                                    width: '100%',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                }}
                                            >
                                                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--el-text-muted)', marginBottom: 2 }}>Quicky</p>
                                                <p style={{ fontSize: 14, color: 'var(--el-text)', lineHeight: 1.4, margin: 0 }}>{quickySuggestion}</p>
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Owl button */}
                            <motion.button
                                type="button"
                                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.92 }}
                                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                                onClick={() => setLauncherExpanded(true)}
                                style={{
                                    width: 52, height: 52,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 9999,
                                    border: '1px solid var(--el-border)',
                                    background: 'var(--el-bg)',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--el-shadow-card)',
                                }}
                                title="Open Quicky"
                                aria-label="Open Quicky"
                            >
                                <span style={{ fontSize: 24 }} aria-hidden="true">🦉</span>
                            </motion.button>
                        </div>
                    )
                )}
            </AnimatePresence>

            {/* Welcome coach overlay */}
            {welcomeUser !== null && (
                <WelcomeCoach
                    userName={welcomeUser}
                    onDone={() => setWelcomeUser(null)}
                />
            )}

            {/* Panels */}
            <AITalkPanel
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                contextSource={contextSource}
                onSwitchToVoice={handleOpenVoice}
            />
            <AIVoicePanel
                isOpen={voiceOpen}
                onClose={() => {
                    setVoiceOpen(false);
                    setAutoVoiceStart(false);
                }}
                contextSource={contextSource}
                autoStart={autoVoiceStart}
                onAutoStartHandled={() => setAutoVoiceStart(false)}
                onSwitchToText={handleOpenChat}
            />

            {location.pathname.startsWith('/dashboard') && <GuidedTour />}
        </TourProvider>
    );
};

export default Layout;
