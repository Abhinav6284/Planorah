import React from 'react';
import { motion } from 'framer-motion';

export default function Loader({ message = "Loading..." }) {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center z-50">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="relative flex flex-col items-center gap-8">
                {/* Elegant spinner */}
                <div className="relative w-16 h-16">
                    {/* Outer ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'conic-gradient(from 0deg, transparent, rgba(99, 102, 241, 0.4), transparent)',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Inner ring */}
                    <motion.div
                        className="absolute inset-1 rounded-full"
                        style={{
                            background: 'conic-gradient(from 180deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
                        }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Center circle */}
                    <div className="absolute inset-3 bg-white dark:bg-gray-900 rounded-full shadow-inner" />

                    {/* Pulsing core */}
                    <motion.div
                        className="absolute inset-5 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full"
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                {/* Message */}
                <div className="flex flex-col items-center gap-3">
                    <motion.p
                        className="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wide"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {message}
                    </motion.p>

                    {/* Minimal progress bar */}
                    <div className="w-32 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
