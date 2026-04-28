import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

const FireAnimation = ({ streak }) => {
    return (
        <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
            {/* Background Glow */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute inset-0 bg-orange-500 rounded-full blur-3xl"
            />

            {/* Main Fire Icon Layer 1 (Base) */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                className="relative z-10"
            >
                <Flame size={160} className="text-orange-600 drop-shadow-lg" fill="currentColor" />
            </motion.div>

            {/* Main Fire Icon Layer 2 (Inner - lighter) */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                className="absolute z-20 top-2"
            >
                <Flame size={140} className="text-orange-500" fill="currentColor" />
            </motion.div>

            {/* Main Fire Icon Layer 3 (Core - yellow) */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
                className="absolute z-30 top-4"
            >
                <Flame size={100} className="text-yellow-400" fill="currentColor" />
            </motion.div>

            {/* Bouncing Animation Wrapper */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute inset-0 z-40 flex items-center justify-center"
            >
                {/* Floating particles or sparks could go here */}
            </motion.div>
        </div>
    );
};

export default function StreakUpdateModal({ streak, onClose }) {
    // Check if we should show the modal
    // Logic: If user has a streak > 0 and hasn't seen the animation today
    // This component assumes the parent decides WHEN to render it, 
    // but we can add an internal check if needed. 
    // For now, let's assume parent handles conditional rendering 
    // OR we check localStorage on mount.

    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (streak > 0) {
            const end = Date.now() + 1000;
            const colors = ['#f97316', '#ef4444', '#eab308'];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [streak]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-white dark:bg-charcoalDark rounded-3xl p-8 shadow-2xl overflow-hidden text-center"
                    >
                        {/* Decorative background circles */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                Streak Updated!
                            </h2>

                            <FireAnimation streak={streak} />

                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="mb-8"
                            >
                                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 font-sans tracking-tight">
                                    {streak}
                                </div>
                                <div className="text-lg font-medium text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wide">
                                    Day Streak
                                </div>
                            </motion.div>

                            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xs mx-auto">
                                You're on fire! Keep up the good work and maintain your momentum.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClose}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-shadow"
                            >
                                Continue
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
