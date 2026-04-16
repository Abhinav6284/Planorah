import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import AITalkPanel from './Mentoring/AITalkPanel';
import AIVoicePanel from './Mentoring/AIVoicePanel';
import WelcomeCoach from './Onboarding/WelcomeCoach';
import { TourProvider } from './Tour/TourContext';
import GuidedTour from './Tour/GuidedTour';
import { Menu, MessageSquare, Mic, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '../api/userService';
import { getUserAvatar } from '../utils/avatar';

const REALTIME_ONBOARDING_INTRO_KEY = 'show_realtime_onboarding_intro';

// Map route prefixes to context sources
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

const Layout = () => {
    const [chatOpen, setChatOpen] = useState(false);
    const [voiceOpen, setVoiceOpen] = useState(false);
    const [launcherExpanded, setLauncherExpanded] = useState(false);
    const [welcomeUser, setWelcomeUser] = useState(null);
    const [autoVoiceStart, setAutoVoiceStart] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const contextSource = getContextSource(location.pathname);

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

        if (shouldAutoStartRealtimeIntro) {
            return;
        }

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
            <div className="min-h-screen bg-gradient-to-br from-beigePrimary via-beigeSecondary to-beigeMuted dark:bg-charcoalDark transition-colors duration-200 font-sans flex">
                {/* Desktop Sidebar */}
                <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} user={user} />

                {/* Main Content Column */}
                <div className="flex-1 min-w-0 flex flex-col">
                    {/* Mobile Top Bar */}
                    <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-beigePrimary/95 dark:bg-[#0f0f0f]/95 border-b border-borderMuted dark:border-white/10 backdrop-blur-md">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-borderMuted dark:border-white/10 bg-white dark:bg-white/5 text-textPrimary dark:text-white hover:bg-beigeMuted dark:hover:bg-white/10 transition-colors"
                            aria-label="Open navigation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <Link to="/dashboard" className="text-lg font-serif font-bold text-textPrimary dark:text-white">
                            Planorah<span className="text-terracotta">.</span>
                        </Link>
                        <Link to="/profile" className="w-9 h-9 rounded-full overflow-hidden border border-borderMuted hover:border-terracotta transition-colors">
                            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                        </Link>
                    </div>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto">
                        <Outlet />
                    </main>
                </div>

                {/* Floating Quicky dock */}
                <AnimatePresence>
                    {!chatOpen && !voiceOpen && (
                        launcherExpanded ? (
                            <motion.div
                                key="quicky-expanded"
                                initial={{ opacity: 0, y: 14, scale: 0.94 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                                className="fixed bottom-5 right-4 z-50 w-[min(94vw,320px)] rounded-2xl border-2 border-borderMuted dark:border-white/10 bg-white/95 dark:bg-charcoal/95 p-3 shadow-[0_8px_0_0_rgba(234,230,219,1)] dark:shadow-[0_18px_36px_rgba(0,0,0,0.5)] backdrop-blur-lg"
                            >
                                <div className="mb-3 flex items-center justify-between rounded-xl border border-borderMuted dark:border-white/10 bg-beigeSecondary/70 dark:bg-charcoalMuted/60 px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg" aria-hidden="true">🦉</span>
                                        <div className="leading-tight">
                                            <p className="text-sm font-bold text-textPrimary dark:text-gray-100">Quicky Assistant</p>
                                            <p className="text-[11px] font-medium text-textSecondary dark:text-gray-400">Message-to-message and voice-to-voice</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setLauncherExpanded(false)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-borderMuted bg-white text-textSecondary transition-colors hover:bg-beigeSecondary dark:border-white/10 dark:bg-charcoalDark dark:text-gray-300 dark:hover:bg-charcoalMuted"
                                        title="Minimize Quicky"
                                        aria-label="Minimize Quicky"
                                    >
                                        <X className="h-4 w-4" strokeWidth={2.4} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <motion.button
                                        whileHover={{ y: -1, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleOpenChat}
                                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-borderMuted dark:border-charcoalMuted bg-white dark:bg-charcoalDark px-3 py-2.5 text-sm font-semibold text-textPrimary dark:text-gray-100 transition-colors hover:border-terracotta/45 dark:hover:border-terracotta/45 hover:bg-beigeSecondary dark:hover:bg-charcoalMuted"
                                    >
                                        <MessageSquare className="h-4 w-4 text-terracotta" strokeWidth={2.2} />
                                        <span>Text</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ y: -1, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleOpenVoice}
                                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-terracotta bg-terracotta px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terracottaHover"
                                    >
                                        <Mic className="h-4 w-4" strokeWidth={2.2} />
                                        <span>Voice</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <div key="quicky-collapsed" className="fixed bottom-5 right-4 z-50">
                                {/* Thinking dots bubble */}
                                <motion.div
                                    initial={{ opacity: 0, y: 4, scale: 0.85 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.85 }}
                                    transition={{ delay: 0.3, type: 'spring', stiffness: 320, damping: 28 }}
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white dark:bg-charcoal border border-borderMuted dark:border-white/10 shadow-sm whitespace-nowrap"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '180ms', animationDuration: '1s' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '360ms', animationDuration: '1s' }} />
                                </motion.div>

                                {/* Pulsing ring */}
                                <span className="absolute inset-0 rounded-full bg-terracotta/20 animate-ping" style={{ animationDuration: '2s' }} />

                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, y: 14, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.92 }}
                                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                                    onClick={() => setLauncherExpanded(true)}
                                    className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-borderMuted dark:border-white/10 bg-white/95 dark:bg-charcoal/95 shadow-[0_10px_26px_rgba(47,39,32,0.25)] backdrop-blur-lg"
                                    title="Open Quicky"
                                    aria-label="Open Quicky"
                                >
                                    <span className="text-2xl" aria-hidden="true">🦉</span>
                                </motion.button>
                            </div>
                        )
                    )}
                </AnimatePresence>

                {/* Welcome coach overlay — shown once after onboarding */}
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

                {/* Guided tour — only on dashboard routes */}
                {location.pathname.startsWith('/dashboard') && <GuidedTour />}
            </div>
        </TourProvider>
    );
};

export default Layout;
