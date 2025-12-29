import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { schedulerService } from "../../api/schedulerService";
import { userService } from "../../api/userService";

// Widgets
import ProfileCard from "./NewWidgets/ProfileCard";
import ClockWidget from "./NewWidgets/ClockWidget";
import MusicWidget from "./NewWidgets/MusicWidget";
import TaskSchedulerWidget from "./NewWidgets/TaskSchedulerWidget";
import StatsWidget from "./NewWidgets/StatsWidget";
import ProgressChartWidget from "./NewWidgets/ProgressChartWidget";
import QuickStatsWidget from "./NewWidgets/QuickStatsWidget";

export default function OverviewSection() {
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ completed: 0, pending: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, tasksData, profileData] = await Promise.all([
                    schedulerService.getDashboardStats(),
                    schedulerService.getTasks(),
                    userService.getProfile().catch(() => null)
                ]);

                // Merge profile data for better name display and stats
                const profile = {
                    ...statsData?.profile,
                    first_name: profileData?.first_name,
                    last_name: profileData?.last_name,
                    username: profileData?.username,
                    xp: profileData?.xp_points || 0 // Map backend xp_points to xp prop
                };
                setUserProfile(profile);
                setTasks(tasksData || []);

                // Calculate stats
                const completedCount = tasksData?.filter(t => t.status === 'completed').length || 0;
                const pendingCount = tasksData?.filter(t => t.status !== 'completed').length || 0;
                setStats({ completed: completedCount, pending: pendingCount });
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-black">
            <div className="text-gray-400 animate-pulse text-lg">Loading dashboard...</div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto font-sans bg-[#F5F5F7] dark:bg-black min-h-screen transition-colors duration-200">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-between items-end"
            >
                <div>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white tracking-tight">
                        {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, <span className="font-medium">{userProfile?.first_name || userProfile?.username?.split(/(?=[A-Z])/)[0] || "there"}!</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Here's your learning overview for today.</p>
                </div>

                {/* Quick Stats (Moved here - Adjacent to Welcome) */}
                <div className="hidden lg:block pb-1">
                    <QuickStatsWidget tasks={tasks} />
                </div>
            </motion.header>

            {/* Asymmetric Dashboard Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
                {/* --- Left Column (Main Content) - Span 8 --- */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Top: Task Scheduler (Calendar + Tasks) - NOW MAJOR WIDGET */}
                    <motion.div variants={itemVariants} className="flex-1 min-h-[400px] md:min-h-[500px]">
                        <TaskSchedulerWidget tasks={tasks} />
                    </motion.div>

                    {/* Middle: Stats & Music Row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 md:h-[320px]">
                        {/* Stats Widget */}
                        <motion.div variants={itemVariants} className="md:col-span-4 h-auto md:h-full">
                            <StatsWidget completed={stats.completed} pending={stats.pending} />
                        </motion.div>

                        {/* Music Widget */}
                        <motion.div variants={itemVariants} className="md:col-span-8 h-auto md:h-full">
                            <MusicWidget />
                        </motion.div>
                    </div>
                </div>

                {/* --- Right Column (Side Panel) - Span 4 --- */}
                <div className="lg:col-span-4 flex flex-col gap-6">



                    {/* Middle: Progress Chart (Moved here) */}
                    <motion.div variants={itemVariants} className="h-auto md:h-[280px] bg-white dark:bg-[#111] rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <ProgressChartWidget data={tasks} />
                    </motion.div>

                    {/* Middle: Clock Widget */}
                    <motion.div variants={itemVariants} className="h-auto md:h-[260px]">
                        <ClockWidget />
                    </motion.div>

                    {/* Bottom: Profile Card */}
                    <motion.div variants={itemVariants} className="h-auto">
                        <ProfileCard user={userProfile} />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
