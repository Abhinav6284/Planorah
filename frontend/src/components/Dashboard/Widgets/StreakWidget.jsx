import React from 'react';
import { motion } from 'framer-motion';

export default function StreakWidget({ streak, xp, level }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-black to-gray-800 dark:from-white dark:to-gray-200 p-6 rounded-3xl text-white dark:text-black shadow-lg"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="text-xs font-bold uppercase tracking-widest opacity-70">Current Streak</div>
                <div className="text-2xl">🔥</div>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-serif font-bold">{streak || 0}</span>
                <span className="text-sm font-medium opacity-70">Days</span>
            </div>

            <div className="flex justify-between items-end border-t border-white/20 dark:border-black/10 pt-4">
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Total XP</div>
                    <div className="text-xl font-bold">{xp || 0}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Level</div>
                    <div className="px-3 py-1 bg-white/20 dark:bg-black/10 rounded-full text-xs font-bold backdrop-blur-sm">
                        {level || "Novice"}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
