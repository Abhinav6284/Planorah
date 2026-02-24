import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function OnboardingLayout({ children, title, subtitle }) {
    return (
        <div className="onboarding-shell min-h-screen flex flex-col font-sans text-gray-900 dark:text-white transition-colors duration-300">
            <header className="fixed top-0 left-0 w-full p-6 md:p-8 z-50 bg-white/45 dark:bg-slate-950/45 backdrop-blur-md border-b border-white/40 dark:border-slate-800/60">
                <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Planorah<span className="text-slate-500 dark:text-slate-400">.</span>
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="onboarding-panel w-full max-w-4xl mx-auto"
                >
                    {title && (
                        <div className="mb-12">
                            {typeof title === 'object' && title.badge && (
                                <div className="inline-block mb-6">
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-semibold rounded-full uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                                        {title.badge}
                                    </span>
                                </div>
                            )}
                            <h1 className="text-4xl md:text-5xl font-serif font-medium mb-6 leading-tight text-gray-900 dark:text-white">
                                {typeof title === 'object' ? title.text : title}
                            </h1>
                            {subtitle && (
                                <p className="text-xl text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="w-full onboarding-content">
                        {children}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
