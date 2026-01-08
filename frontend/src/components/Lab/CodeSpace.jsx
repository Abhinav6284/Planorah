import React from 'react';
import { motion } from 'framer-motion';
import { FaCode, FaRocket, FaClock } from 'react-icons/fa';

const CodeSpace = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 relative inline-block"
                >
                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                    <div className="relative bg-white dark:bg-gray-800 w-32 h-32 rounded-3xl flex items-center justify-center shadow-xl mx-auto border border-gray-100 dark:border-gray-700">
                        <FaCode className="text-6xl text-blue-500" />
                    </div>
                    <motion.div
                        initial={{ scale: 0, x: 20 }}
                        animate={{ scale: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform rotate-12"
                    >
                        <FaRocket className="text-white text-lg" />
                    </motion.div>
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6"
                >
                    CodeSpace is <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Coming Soon</span>
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-lg mx-auto leading-relaxed"
                >
                    We're building a powerful cloud-based IDE just for you. Write, run, and deploy code directly from your browser with full GitHub integration.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
                        <FaClock />
                        Notify Me When Ready
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="px-8 py-4 bg-transparent border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                        Go Back
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="bg-blue-100 dark:bg-blue-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto text-blue-600 dark:text-blue-400">
                            <FaCode />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">VS Code Engine</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Monaco Editor for a familiar experience</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto text-purple-600 dark:text-purple-400">
                            <FaRocket />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Instant Deploy</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Push to GitHub and deploy in one click</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="bg-green-100 dark:bg-green-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto text-green-600 dark:text-green-400">
                            <FaClock />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Real-time Collab</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Code together with your team in real-time</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CodeSpace;
