import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { schedulerService } from "../../api/schedulerService";
import { userService } from "../../api/userService";

// Widgets
import ProfileCard from "./NewWidgets/ProfileCard";
import ClockWidget from "./NewWidgets/ClockWidget";
import TaskSchedulerWidget from "./NewWidgets/TaskSchedulerWidget";
import StatsWidget from "./NewWidgets/StatsWidget";
import ProgressChartWidget from "./NewWidgets/ProgressChartWidget";
import QuickStatsWidget from "./NewWidgets/QuickStatsWidget";
import GitHubWidget from "./NewWidgets/GitHubWidget";
import SubscriptionWidget from "./NewWidgets/SubscriptionWidget";
import PortfolioWidget from "./NewWidgets/PortfolioWidget";
import CalendarWidget from "./NewWidgets/CalendarWidget";
import RoadmapProgressWidget from "./NewWidgets/RoadmapProgressWidget";

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
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-gray-400 text-lg">Loading dashboard...</div>
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto font-sans bg-[#F5F5F7] dark:bg-black min-h-screen transition-colors duration-200">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 sm:mb-8"
            >
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white tracking-tight">
                            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, <span className="font-medium">{userProfile?.first_name || userProfile?.username?.split(/(?=[A-Z])/)[0] || "there"}!</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">Here's your learning overview for today.</p>
                    </div>

                    {/* Quick Stats - Mobile: Show as row, Desktop: Show inline */}
                    <div className="flex flex-wrap gap-2 sm:hidden">
                        <QuickStatsWidget tasks={tasks} />
                    </div>
                    <div className="hidden sm:flex lg:hidden">
                        <QuickStatsWidget tasks={tasks} />
                    </div>
                </div>

                {/* Quick Stats - Large screens: Adjacent to Welcome */}
                <div className="hidden lg:flex justify-end mt-4">
                    <QuickStatsWidget tasks={tasks} />
                </div>
            </motion.header>

            {/* Dashboard Grid - Responsive Layout */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6"
            >
                {/* --- Left Column (Main Content) - Full width on mobile, 8 cols on lg --- */}
                <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">

                    {/* Task Scheduler - Main Widget */}
                    <motion.div variants={itemVariants}>
                        <TaskSchedulerWidget tasks={tasks} />
                    </motion.div>

                    {/* Stats Widget - Full Width */}
                    <motion.div variants={itemVariants}>
                        <StatsWidget completed={stats.completed} pending={stats.pending} />
                    </motion.div>

                    {/* Bottom Row: GitHub & Portfolio - Stack on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <motion.div variants={itemVariants} className="min-h-[280px]">
                            <GitHubWidget />
                        </motion.div>
                        <motion.div variants={itemVariants} className="min-h-[280px]">
                            <PortfolioWidget />
                        </motion.div>
                    </div>
                </div>

                {/* --- Right Column (Side Panel) - Full width on mobile, 4 cols on lg --- */}
                <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">

                    {/* Roadmap Progress Widget */}
                    <motion.div variants={itemVariants} className="min-h-[200px]">
                        <RoadmapProgressWidget />
                    </motion.div>

                    {/* Calendar Widget */}
                    <motion.div variants={itemVariants} className="min-h-[250px]">
                        <CalendarWidget />
                    </motion.div>

                    {/* Progress Chart - Hidden on mobile to reduce clutter */}
                    <motion.div variants={itemVariants} className="hidden sm:block min-h-[250px] bg-white dark:bg-[#111] rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <ProgressChartWidget data={tasks} />
                    </motion.div>

                    {/* Two Column Layout for smaller widgets on tablet */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
                        {/* Subscription Widget */}
                        <motion.div variants={itemVariants} className="min-h-[180px]">
                            <SubscriptionWidget />
                        </motion.div>

                        {/* Clock Widget */}
                        <motion.div variants={itemVariants} className="min-h-[180px]">
                            <ClockWidget />
                        </motion.div>
                    </div>

                    {/* Profile Card */}
                    <motion.div variants={itemVariants} className="min-h-[200px]">
                        <ProfileCard user={userProfile} />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
