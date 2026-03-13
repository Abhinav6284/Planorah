import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Dashboard/Header';
import AITalkPanel from './Mentoring/AITalkPanel';
import AIVoicePanel from './Mentoring/AIVoicePanel';
import WelcomeCoach from './Onboarding/WelcomeCoach';
import { FaBrain, FaMicrophone } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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
    if (pathname.startsWith('/assistant')) return 'assistant';
    return 'general';
};

const Layout = () => {
    const [chatOpen, setChatOpen] = useState(false);
    const [voiceOpen, setVoiceOpen] = useState(false);
    const [fabExpanded, setFabExpanded] = useState(false);
    const [welcomeUser, setWelcomeUser] = useState(null);
    const location = useLocation();
    const contextSource = getContextSource(location.pathname);

    useEffect(() => {
        const flag = sessionStorage.getItem('show_welcome_coach');
        if (flag) setWelcomeUser(flag === 'true' ? '' : flag);
    }, []);

    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-gray-900 transition-colors duration-200 font-sans flex flex-col">
            <Header />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>

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
                                <FaBrain className="text-xs" />
                                AI Chat
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>

                {/* Main FAB */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFabExpanded(!fabExpanded)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200
                        ${fabExpanded
                            ? 'bg-gray-700 hover:bg-gray-800 rotate-45'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                        } text-white`}
                >
                    {fabExpanded ? (
                        <span className="text-xl font-light">+</span>
                    ) : (
                        <FaBrain className="text-lg" />
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
                onClose={() => setVoiceOpen(false)}
                contextSource={contextSource}
            />
        </div>
    );
};

export default Layout;
