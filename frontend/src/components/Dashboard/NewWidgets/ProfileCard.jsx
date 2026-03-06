import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const ProfileCard = ({ user, streak }) => {
    // Current streak count
    const currentStreak = streak?.streak?.current || 0;

    // Calculate last 7 days
    const weekDays = useMemo(() => {
        const days = [];
        const today = new Date();

        // Helper to check if a date string matches in heatmap
        const checkActive = (d, heatmap) => {
            if (!heatmap) return false;
            const iso = d.toISOString().split('T')[0];
            const local = d.toLocaleDateString('en-CA'); // YYYY-MM-DD local
            return (heatmap[iso] > 0) || (heatmap[local] > 0);
        };

        // Create the last 7 days array (reversed to show Mon -> Sun or similar order if needed, but usually Today is last)
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);

            const heatmap = streak?.activity_heatmap || {};
            let isActive = checkActive(d, heatmap);

            // FALLBACK LOGIC:
            // if we have a streak of X days, and NO heatmap data (or very sparse),
            // assume the last X days including today are active.
            // This ensures the visual matches the count even if the backend heatmap is missing.
            if ((!heatmap || Object.keys(heatmap).length === 0) && currentStreak > 0) {
                if (i < currentStreak) isActive = true; // Simple fallback: last N days
            }

            days.push({
                dayLabel: d.toLocaleDateString('en-US', { weekday: 'narrow' }), // M, T, W...
                fullDate: d.toISOString().split('T')[0],
                active: isActive,
                isToday: i === 0
            });
        }
        return days;
    }, [streak, currentStreak]);

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 flex flex-col gap-6 border border-gray-100 dark:border-gray-800/60 shadow-xl shadow-gray-100/50 dark:shadow-none relative overflow-hidden group">

            {/* Header Section */}
            <div className="flex items-center justify-between z-10 w-full">
                <div className="flex items-center gap-4">
                    <Link to="/settings" className="relative group/avatar flex-shrink-0">
                        <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-orange-400 via-red-500 to-purple-600 shadow-lg shadow-orange-500/20 group-hover/avatar:shadow-orange-500/40 transition-all duration-300">
                            <img
                                src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.username || "default")}
                                alt="User"
                                className="w-full h-full rounded-full bg-white dark:bg-zinc-900 object-cover border-2 border-white dark:border-zinc-900"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-800 p-1.5 rounded-full border border-gray-100 dark:border-zinc-700 shadow-sm">
                            <div className="text-[10px]">✏️</div>
                        </div>
                    </Link>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            {user?.username || "Student"}
                            {user?.level && <span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 text-[10px] font-bold uppercase tracking-wider">Level {user.level}</span>}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {user?.role || "Planora Learner"}
                        </p>
                    </div>
                </div>

                {/* Big Streak Counter */}
                <div className="flex flex-col items-end">
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="text-4xl filter drop-shadow-lg"
                        >
                            🔥
                        </motion.div>
                        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-[#1C1C1E] shadow-sm">
                            {currentStreak}
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak Visualization - "Duolingo Style" */}
            <div className="z-10 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-gray-100 dark:border-white/5 w-full">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        This Week
                    </span>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                        {weekDays.filter(d => d.active).length} / 7 Days
                    </span>
                </div>

                <div className="flex justify-between items-center relative w-full px-1">
                    {/* Connecting Line (Background) */}
                    <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-gray-200 dark:bg-zinc-800 -translate-y-1/2 rounded-full z-0" />

                    {weekDays.map((day, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 relative z-10 group/day">
                            <div className="relative">
                                {/* Glow Effect for Active Days */}
                                {day.active && (
                                    <div className="absolute -inset-3 bg-orange-500/20 rounded-full blur-md animate-pulse" />
                                )}

                                <div
                                    className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${day.active
                                            ? 'bg-gradient-to-b from-orange-400 to-red-600 shadow-lg shadow-orange-500/40 scale-110 border-2 border-orange-300 dark:border-orange-500' // Fire State
                                            : day.isToday
                                                ? 'bg-white dark:bg-zinc-800 border-2 border-dashed border-gray-300 dark:border-zinc-600 text-gray-400' // Incomplete Today
                                                : 'bg-gray-100 dark:bg-zinc-800/80 border-2 border-transparent text-gray-300 dark:text-zinc-700' // Incomplete Past
                                        }`}
                                >
                                    {day.active ? (
                                        <Flame size={20} className="text-white fill-white animate-pulse" strokeWidth={0} />
                                    ) : (
                                        <div className={`text-xs font-bold ${day.isToday ? 'text-gray-500' : ''}`}>
                                            {day.isToday && !day.active ?
                                                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
                                                :
                                                day.dayLabel
                                            }
                                        </div>
                                    )}

                                    {/* Small Checkmark Badge for completed days */}
                                    {day.active && (
                                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full p-0.5 border-2 border-white dark:border-zinc-900 shadow-sm">
                                            <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Day Label below */}
                            <span className={`text-[10px] font-bold uppercase ${day.active
                                    ? 'text-orange-600 dark:text-orange-500'
                                    : day.isToday
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-400 dark:text-gray-600'
                                }`}>
                                {day.dayLabel}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subtle Texture/Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
        </div>
    );
};

export default ProfileCard;
