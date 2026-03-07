import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { schedulerService } from "../../api/schedulerService";
import { userService } from "../../api/userService";

// Components
import AIVoicePanel from "../Mentoring/AIVoicePanel";
import StreakUpdateModal from "./Modals/StreakUpdateModal";

// Widgets
import ProfileCard from "./NewWidgets/ProfileCard";
import DateTasksWidget from "./NewWidgets/DateTasksWidget";
// import AIHelpWidget removed
import OnboardingWidget from "./NewWidgets/OnboardingWidget";
import TaskSchedulerWidget from "./NewWidgets/TaskSchedulerWidget";
import ProgressChartWidget from "./NewWidgets/ProgressChartWidget";
import QuickStatsWidget from "./NewWidgets/QuickStatsWidget";
import CodeSpaceWidget from "./NewWidgets/CodeSpaceWidget";
import ResearchWidget from "./NewWidgets/ResearchWidget";
import PortfolioWidget from "./NewWidgets/PortfolioWidget";
import CalendarWidget from "./NewWidgets/CalendarWidget";

const ElevenLabsVoiceButton = ({ onClick }) => {
    return (
        <motion.div
            layout
            onClick={onClick}
            className="flex items-center h-[42px] px-[10px] rounded-[24px] cursor-pointer transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)] border bg-[#fcfcfc] dark:bg-gray-900 border-gray-200/80 dark:border-gray-700 hover:bg-[#f3f4f6] dark:hover:bg-gray-800 gap-2.5"
        >
            {/* The Orb */}
            <motion.div layout className="relative w-[26px] h-[26px] rounded-full overflow-hidden shrink-0 shadow-[0_1px_3px_rgba(37,99,235,0.2)]">
                {/* Base color & inner glow */}
                <div className="absolute inset-0 bg-[#005be4]" />
                {/* Conic spinning highlight */}
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(0,242,254,0.8)_120deg,rgba(79,172,254,0.9)_180deg,transparent_240deg)] animate-[spin_3s_linear_infinite]" />
                {/* Inner radial gradient for 3D sphere effect */}
                <div className="absolute inset-[1px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.7)_0%,transparent_50%,rgba(0,0,0,0.2)_100%)] mix-blend-overlay border-[0.5px] border-white/20" />
            </motion.div>

            <motion.div layout className="overflow-hidden flex items-center pr-1">
                <motion.span
                    className="text-[15px] font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap"
                >
                    Voice chat
                </motion.span>
            </motion.div>
        </motion.div>
    );
};

export default function OverviewSection() {
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [streakData, setStreakData] = useState(null);
    const [voicePanelOpen, setVoicePanelOpen] = useState(false);
    const [showStreakModal, setShowStreakModal] = useState(false);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        const fetchData = async () => {
            try {
                // Idempotent daily login ping for streak update
                await userService.dailyLogin().catch(() => null);

                const [statsData, tasksData, profileData, detailedStats] = await Promise.all([
                    schedulerService.getDashboardStats(),
                    schedulerService.getTasks(),
                    userService.getProfile().catch(() => null),
                    userService.getStatistics().catch(() => null)
                ]);

                // Merge profile data for better name display and stats
                const profile = {
                    ...statsData?.profile,
                    first_name: profileData?.first_name,
                    last_name: profileData?.last_name,
                    username: profileData?.username,
                    field_of_study: profileData?.profile?.field_of_study || profileData?.field_of_study || '',
                    xp: profileData?.xp_points || 0 // Map backend xp_points to xp prop
                };
                setUserProfile(profile);
                setTasks(tasksData || []);
                setStreakData(detailedStats);

                // Show streak animation if applicable
                const currentStreak = detailedStats?.streak?.current || 0;
                if (currentStreak > 0) {
                    const lastSeen = localStorage.getItem('streakAnimationDate');
                    const today = new Date().toDateString();
                    if (lastSeen !== today) {
                        setShowStreakModal(true);
                    }
                }
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
        <div className="p-3 sm:p-4 lg:p-6 max-w-[1600px] mx-auto font-sans bg-[#F5F5F7] dark:bg-black min-h-screen transition-colors duration-200">
            {/* Top Bar: Date + Greeting + Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3 sm:mb-4"
            >
                {/* Date & Tasks Widget */}
                <DateTasksWidget tasks={tasks} />

                {/* Greeting - Next to calendar */}
                <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white tracking-tight">
                        {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, <span className="font-semibold">{userProfile?.first_name || userProfile?.username?.split(/(?=[A-Z])/)[0] || "there"}!</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Here's your learning overview for today.</p>
                </div>

                {/* Quick Stats - Right side */}
                <div className="flex flex-wrap gap-2 items-center">
                    <QuickStatsWidget tasks={tasks} />

                    {/* Voice Chat Button */}
                    <ElevenLabsVoiceButton onClick={() => setVoicePanelOpen(true)} />
                </div>
            </motion.div>

            {/* AI Help Widget removed */}

            {/* Dashboard Grid - Responsive Layout */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4"
            >
                {/* --- Left Column (Main Content) - Full width on mobile, 8 cols on lg --- */}
                <div className="lg:col-span-8 flex flex-col gap-3 sm:gap-4">

                    {/* Task Scheduler - Main Widget */}
                    <motion.div variants={itemVariants}>
                        <TaskSchedulerWidget tasks={tasks} />
                    </motion.div>

                    {/* Bottom Row: GitHub/Research & Portfolio - Stack on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <motion.div variants={itemVariants} className="min-h-[240px]">
                            {/* Show GitHub for CS/IT, Research for Medical/Science only */}
                            {(userProfile?.field_of_study?.toLowerCase().includes('computer') ||
                                userProfile?.field_of_study?.toLowerCase().includes('it')) ? (
                                <CodeSpaceWidget />
                            ) : (userProfile?.field_of_study?.toLowerCase().includes('medical') ||
                                userProfile?.field_of_study?.toLowerCase().includes('life') ||
                                userProfile?.field_of_study?.toLowerCase().includes('science') ||
                                userProfile?.field_of_study?.toLowerCase().includes('doctor')) ? (
                                <ResearchWidget userField={userProfile?.field_of_study} />
                            ) : (
                                <PortfolioWidget />
                            )}
                        </motion.div>
                        <motion.div variants={itemVariants} className="min-h-[240px]">
                            <CalendarWidget />
                        </motion.div>
                    </div>

                    {/* Weekly Progress Chart */}
                    <motion.div variants={itemVariants}>
                        <ProgressChartWidget data={tasks} />
                    </motion.div>
                </div>

                {/* --- Right Column (Side Panel) - Full width on mobile, 4 cols on lg --- */}
                <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">

                    {/* Profile Card - Full Width */}
                    <motion.div variants={itemVariants}>
                        <ProfileCard user={userProfile} streak={streakData} />
                    </motion.div>

                    {/* Onboarding AI Guidance */}
                    <motion.div variants={itemVariants}>
                        <OnboardingWidget />
                    </motion.div>

                </div>
            </motion.div>

            {/* Streak Success Modal */}
            {showStreakModal && (
                <StreakUpdateModal
                    streak={streakData?.streak?.current || 0}
                    onClose={() => {
                        localStorage.setItem('streakAnimationDate', new Date().toDateString());
                        setShowStreakModal(false);
                    }}
                />
            )}

            {/* Voice Chat Panel Modal */}
            <AIVoicePanel
                isOpen={voicePanelOpen}
                onClose={() => setVoicePanelOpen(false)}
                contextSource="dashboard"
            />
        </div>
    );
}
