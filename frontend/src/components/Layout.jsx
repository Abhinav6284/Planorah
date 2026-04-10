import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import AITalkPanel from './Mentoring/AITalkPanel';
import AIVoicePanel from './Mentoring/AIVoicePanel';
import WelcomeCoach from './Onboarding/WelcomeCoach';
import { TourProvider } from './Tour/TourContext';
import GuidedTour from './Tour/GuidedTour';
import { FaMicrophone } from 'react-icons/fa';
import { Menu } from 'lucide-react';
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
    const [fabExpanded, setFabExpanded] = useState(false);
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

            {/* Floating AI Mentor FAB */}
            <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
                <AnimatePresence>
                    {fabExpanded && (
                        <>
                            {/* Voice button */}
                            <motion.button
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                transition={{ duration: 0.15, delay: 0.05 }}
                                onClick={() => { setVoiceOpen(true); setFabExpanded(false); }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium shadow-lg shadow-purple-500/25 transition-colors"
                            >
                                <FaMicrophone className="text-xs" />
                                AI Talk
                            </motion.button>

                            {/* Chat button */}
                            <motion.button
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => { setChatOpen(true); setFabExpanded(false); }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-colors"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                AI Chat
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>

                {/* Main FAB — AI Orb */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFabExpanded(!fabExpanded)}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/30 overflow-hidden relative transition-all duration-200"
                >
                    {fabExpanded ? (
                        <div className="absolute inset-0 bg-gray-700 hover:bg-gray-800 flex items-center justify-center">
                            <span className="text-xl font-light text-white">✕</span>
                        </div>
                    ) : (
                        <>
                            {/* Orb base */}
                            <div className="absolute inset-0 bg-[#005be4]" />
                            {/* Spinning conic highlight */}
                            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(0,242,254,0.85)_120deg,rgba(79,172,254,0.95)_180deg,transparent_240deg)] animate-[spin_3s_linear_infinite]" />
                            {/* 3D sphere inner glow */}
                            <div className="absolute inset-[2px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.6)_0%,transparent_50%,rgba(0,0,0,0.15)_100%)] mix-blend-overlay" />
                            {/* Chat icon */}
                            <svg className="relative z-10 text-white drop-shadow-sm" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </>
                    )}
                </motion.button>
            </div>

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
            />

            {/* Guided tour — only on dashboard routes */}
            {location.pathname.startsWith('/dashboard') && <GuidedTour />}
        </div>
        </TourProvider>
    );
};

export default Layout;
