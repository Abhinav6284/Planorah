import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { getUserAvatar } from '../../../utils/avatar';

const ProfileCard = ({ user, streak }) => {
    // Current streak count
    const currentStreak = streak?.streak?.current || 0;

    // Milestone calculation: 7, 14, 21, 28...
    const weekNumber = Math.ceil(currentStreak / 7) || 1;
    const nextMilestone = weekNumber * 7;

    // How many days completed within the current milestone window (0-based)
    // e.g. streak=1 → 0, streak=7 → 6, streak=8 → 0, streak=10 → 2
    const daysIntoCurrentMilestone = currentStreak === 0 ? 0 : (currentStreak - 1) % 7;

    // 7 dots representing the current milestone window (infinitely repeating)
    const weekDays = useMemo(() => {
        const days = [];
        const today = new Date();
        const heatmap = streak?.activity_heatmap || {};

        const checkActive = (d) => {
            if (!heatmap) return false;
            const iso = d.toISOString().split('T')[0];
            const local = d.toLocaleDateString('en-CA');
            return (heatmap[iso] > 0) || (heatmap[local] > 0);
        };

        // i=0 is the first day of this milestone window, i=6 is the last
        for (let i = 0; i < 7; i++) {
            // daysAgo: positive = past, 0 = today, negative = future
            const daysAgo = daysIntoCurrentMilestone - i;
            const d = new Date(today);
            d.setDate(today.getDate() - daysAgo);

            const isToday = daysAgo === 0;
            const isFuture = daysAgo < 0;

            let isActive = false;
            if (!isFuture) {
                isActive = checkActive(d);
                // Fallback: if we know streak covers this day, mark it active
                if (!isActive && currentStreak > 0 && daysAgo <= currentStreak - 1) {
                    isActive = true;
                }
            }

            days.push({
                dayLabel: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                fullDate: d.toISOString().split('T')[0],
                active: isActive,
                isToday,
                isFuture,
            });
        }
        return days;
    }, [streak, currentStreak, daysIntoCurrentMilestone]);

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 flex flex-col gap-6 border border-gray-100 dark:border-gray-800/60 shadow-xl shadow-gray-100/50 dark:shadow-none relative overflow-hidden group">

            {/* Header Section */}
            <div className="flex items-center justify-between z-10 w-full">
                <div className="flex items-center gap-4">
                    <Link to="/settings" className="relative group/avatar flex-shrink-0">
                        <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-orange-400 via-red-500 to-purple-600 shadow-lg shadow-orange-500/20 group-hover/avatar:shadow-orange-500/40 transition-all duration-300">
                            <img
                                src={getUserAvatar(user)}
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
                        Week {weekNumber}
                    </span>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                        {currentStreak} / {nextMilestone} Days
                    </span>
                </div>

                <div className="flex justify-between items-center relative w-full px-1 py-1">
                    {/* Connecting Line (Background) */}
                    <div className="absolute top-[18px] sm:top-[22px] left-4 right-4 h-1 bg-gray-100 dark:bg-zinc-800/80 rounded-full z-0" />

                    {/* Active Line Fill (Dynamic) */}
                    {weekDays.filter(d => d.active).length > 1 && (
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((weekDays.filter(d => d.active).length - 1) / 6) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute top-[18px] sm:top-[22px] left-4 h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full z-0"
                            style={{ maxWidth: 'calc(100% - 2rem)' }}
                        />
                    )}

                    {weekDays.map((day, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 relative z-10 group/day w-8 sm:w-10">
                            {/* Wrapper for the node ensuring center alignment with line */}
                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                                {/* Glow Effect for Active Days */}
                                {day.active && (
                                    <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-md" />
                                )}

                                <div
                                    className={`absolute flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${day.active
                                            ? 'w-full h-full bg-gradient-to-br from-orange-400 to-red-500 shadow-md shadow-orange-500/30 scale-105 z-20'
                                            : day.isToday
                                                ? 'w-6 h-6 sm:w-7 sm:h-7 bg-white dark:bg-[#1C1C1E] border-[2px] border-orange-400 dark:border-orange-500 shadow-sm z-10'
                                                : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-200 dark:bg-zinc-700'
                                        }`}
                                >
                                    {day.active ? (
                                        <Flame size={18} className="text-white fill-white" strokeWidth={0} />
                                    ) : day.isToday ? (
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                    ) : null}
                                </div>
                            </div>

                            {/* Day Label below */}
                            <span className={`text-[10px] font-bold uppercase transition-colors duration-300 ${day.active
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
