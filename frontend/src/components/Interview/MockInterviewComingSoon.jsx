import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function MockInterviewComingSoon() {
    return (
        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating Orbs */}
                <motion.div
                    className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-3xl"
                    style={{ top: '10%', left: '5%' }}
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl"
                    style={{ bottom: '10%', right: '10%' }}
                    animate={{
                        x: [0, -40, 0],
                        y: [0, -20, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 blur-3xl"
                    style={{ top: '50%', right: '30%' }}
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 text-center max-w-3xl mx-auto"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-8"
                >
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide uppercase">
                        In Development
                    </span>
                </motion.div>

                {/* Icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 shadow-2xl shadow-purple-500/30">
                        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 dark:text-white mb-6 tracking-tight"
                >
                    Mock Interview
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-light"
                >
                    Practice makes perfect. Our AI-powered interview simulator is{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 font-medium">
                        coming soon
                    </span>
                    .
                </motion.p>

                {/* Feature Pills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {[
                        { icon: "🎯", text: "Role-Specific Questions" },
                        { icon: "🤖", text: "AI Feedback" },
                        { icon: "📊", text: "Performance Analytics" },
                        { icon: "🎙️", text: "Voice Practice" },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                            className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 dark:border-gray-700/50 text-sm text-gray-700 dark:text-gray-300"
                        >
                            <span>{feature.icon}</span>
                            <span>{feature.text}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Description Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 mb-10"
                >
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                        Get ready to ace your next interview! Our intelligent mock interview system will simulate real interview scenarios,
                        provide instant feedback on your responses, and help you build confidence for the big day.
                    </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        to="/dashboard"
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                    >
                        <span className="relative z-10">Back to Dashboard</span>
                        <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>

                    <button
                        onClick={() => window.open('mailto:support@planorah.com?subject=Notify%20me%20about%20Mock%20Interview', '_blank')}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-2xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    >
                        <span>🔔</span>
                        <span>Notify Me</span>
                    </button>
                </motion.div>

                {/* Progress Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="mt-16"
                >
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-3 font-medium">Development Progress</p>
                    <div className="w-64 mx-auto h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            transition={{ delay: 1.3, duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                        />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">65% Complete</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
