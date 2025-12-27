import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function WelcomePage() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">
            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 z-50 p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-lg"
                aria-label="Toggle theme"
            >
                <span className="text-2xl">{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>

            {/* Background Gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium mb-8 tracking-wide">
                        Ready to begin?
                    </span>

                    <h1 className="text-5xl md:text-7xl font-serif font-medium text-gray-900 dark:text-white mb-8 leading-tight">
                        Your Journey <br />
                        <span className="italic text-gray-400 dark:text-gray-500">Starts Here.</span>
                    </h1>

                    <p className="text-xl text-gray-500 dark:text-gray-400 mb-12 font-light leading-relaxed">
                        Planorah helps you organize your learning, build projects, and achieve your goals in a calm, focused environment.
                    </p>

                    <Link to="/home">
                        <button className="group relative px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full text-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-xl shadow-black/10 dark:shadow-white/10 hover:shadow-2xl hover:-translate-y-1">
                            <span className="relative z-10 flex items-center gap-3">
                                Enter Workspace
                                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>
                    </Link>
                </motion.div>
            </div>

            <div className="absolute bottom-10 text-gray-400 dark:text-gray-500 text-sm font-medium">
                Press Enter to continue
            </div>
        </div>
    );
}
