import React from 'react';
import { motion } from 'framer-motion';

export default function Loader({ message = "Loading..." }) {
    const dots = [0, 1, 2];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-beigePrimary dark:bg-charcoalDark">
            <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="w-[min(92vw,420px)] rounded-2xl border border-borderMuted dark:border-gray-700 bg-white dark:bg-charcoal px-6 py-5 shadow-[0_16px_36px_rgba(47,39,32,0.12)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
            >
                <div className="mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-terracotta" />
                    <span className="h-px flex-1 bg-beigeMuted dark:bg-gray-700" />
                    <span className="h-2 w-2 rounded-full bg-sage dark:bg-sage/80" />
                </div>

                <motion.p
                    className="text-sm font-semibold text-textPrimary dark:text-white"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                >
                    {message}
                </motion.p>

                <div className="mt-4 space-y-2.5">
                    {[78, 62, 70].map((width, index) => (
                        <motion.div
                            key={width}
                            className="h-2 rounded-full bg-beigeMuted dark:bg-gray-700"
                            style={{ width: `${width}%` }}
                            animate={{ opacity: [0.35, 0.8, 0.35] }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: index * 0.16,
                            }}
                        />
                    ))}
                </div>

                <div className="mt-5 flex items-center gap-2">
                    {dots.map((dot) => (
                        <motion.span
                            key={dot}
                            className="h-1.5 w-1.5 rounded-full bg-terracotta"
                            animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.12, ease: 'easeInOut' }}
                        />
                    ))}
                    <span className="ml-1 text-xs text-textSecondary dark:text-gray-400">Please wait</span>
                </div>
            </motion.div>
        </div>
    );
}
