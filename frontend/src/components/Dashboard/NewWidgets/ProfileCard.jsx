import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProfileCard = ({ user, streak }) => {
    // Calculate last 7 days
    const weekDays = useMemo(() => {
        const days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            // Check if active in heatmap
            const isActive = streak?.activity_heatmap?.[dateStr] > 0;

            days.push({
                day: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
                fullDate: dateStr,
                active: isActive,
                isToday: i === 0
            });
        }
        return days;
    }, [streak]);

    const currentStreak = streak?.streak?.current || 0;

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[30px] p-6 h-full flex flex-col justify-between border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
            {/* Header: Avatar and Greeting */}
            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <Link to="/settings" className="relative group">
                        <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500">
                            <img
                                src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.username || "default")}
                                alt="User"
                                className="w-full h-full rounded-full bg-white dark:bg-black object-cover border-2 border-white dark:border-black"
                            />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                            Edit
                        </div>
                    </Link>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {user?.username || "Student"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.role || "Planora Learner"}
                        </p>
                    </div>
                </div>

                {/* Fire Icon for Streak */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-3xl"
                        >
                            🔥
                        </motion.div>
                        <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 rounded-full border border-white dark:border-[#1C1C1E]">
                            {currentStreak}
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak Plan Visualization */}
            <div className="z-10 mt-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Daily Streak</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                    {weekDays.map((day, index) => (
                        <div key={index} className="flex flex-col items-center gap-1.5">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${day.active
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110'
                                        : day.isToday
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 animate-pulse' // Today but not done yet
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                                    }`}
                            >
                                {day.active ? '✓' : day.day}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        </div>
    );
};

export default ProfileCard;
