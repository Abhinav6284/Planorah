import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import AIVoicePanel from '../Mentoring/AIVoicePanel';
import DateTasksWidget from './NewWidgets/DateTasksWidget';
import ProfileCard from './NewWidgets/ProfileCard';
import CalendarWidget from './NewWidgets/CalendarWidget';
import OnboardingWidget from './NewWidgets/OnboardingWidget';

import TodayMissionCard from './Execution/TodayMissionCard';
import AICoachCard from './Execution/AICoachCard';
import FocusMode from './Execution/FocusMode';
import ModeSwitch from './Execution/ModeSwitch';
import ProgressReframeCard from './Execution/ProgressReframeCard';
import GamificationBar from './Execution/GamificationBar';
import ExamModePanel from './Execution/ExamModePanel';

import { useExecutionStore } from '../../store/useExecutionStore';
import { userService } from '../../api/userService';
import { useMissionFlow } from '../../hooks/useMissionFlow';

const ExecutionDashboard = () => {
    const {
        mode,
        setMode,
        todayTask,
        coach,
        progress,
        activeExamPlan,
        loading,
        bootstrap,
        regenerateCoach,
        updateTaskStatus,
        createFocusSession,
        updateFocusSession,
        applyRewards,
        createExamPlan,
        refreshTodayTask,
        setTodayTask,
    } = useExecutionStore();

    const [profile, setProfile] = useState(null);
    const [voicePanelOpen, setVoicePanelOpen] = useState(false);

    useEffect(() => {
        bootstrap();
        userService.getProfile().then(setProfile).catch(() => null);
    }, [bootstrap]);

    const displayName = useMemo(() => {
        const firstName = profile?.first_name;
        if (firstName) return firstName;
        return profile?.username || 'there';
    }, [profile]);

    const {
        focusOpen,
        setFocusOpen,
        rewardPulse,
        handleStartFocus,
        handleFocusComplete,
    } = useMissionFlow({
        todayTask,
        createFocusSession,
        updateFocusSession,
        updateTaskStatus,
        applyRewards,
        refreshTodayTask,
    });

    const handleChangeTask = useCallback(async () => {
        const next = await regenerateCoach();
        setTodayTask((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                title: next.task,
                reason: next.reason,
                difficulty: next.difficulty,
                estimated_time: next.estimated_time,
            };
        });
    }, [regenerateCoach, setTodayTask]);

    return (
        <div className="min-h-screen p-3 sm:p-5 lg:p-6 text-white">
            <div className="max-w-[1580px] mx-auto dark">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4"
                >
                    <DateTasksWidget tasks={[]} variant="execution" />

                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                            Daily Execution Engine
                        </h1>
                        <p className="text-sm text-cyan-50/80 mt-1">
                            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {displayName}. Start with one clear action.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <ModeSwitch mode={mode} onChange={setMode} />
                        <button
                            onClick={() => setVoicePanelOpen(true)}
                            className="px-4 py-2 rounded-xl border border-cyan-300/30 bg-cyan-500/10 text-cyan-100 text-sm font-semibold hover:bg-cyan-500/20"
                        >
                            Voice chat
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                    <div className="xl:col-span-8 space-y-4">
                        <TodayMissionCard
                            task={todayTask}
                            loading={loading.bootstrap && !todayTask}
                            onStart={handleStartFocus}
                            onChangeTask={handleChangeTask}
                        />

                        {rewardPulse && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4"
                            >
                                <p className="text-sm font-semibold text-emerald-100">Mission Complete</p>
                                <p className="text-xs text-emerald-200/90 mt-1">+{rewardPulse.xp} XP • {rewardPulse.streak} day streak • Level {rewardPulse.level}</p>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <AICoachCard coach={coach} onRegenerate={regenerateCoach} loading={loading.coach} />
                            <ProgressReframeCard stats={progress?.stats} weeklyCompleted={progress?.weekly_completed} />
                        </div>

                        <GamificationBar stats={progress?.stats} />

                        {mode === 'exam' && (
                            <ExamModePanel
                                plan={activeExamPlan}
                                loading={loading.examPlan}
                                onGenerate={createExamPlan}
                            />
                        )}

                        {mode === 'learning' && <OnboardingWidget variant="execution" />}
                    </div>

                    <div className="xl:col-span-4 space-y-4">
                        <ProfileCard user={profile} streak={null} variant="execution" />
                        <CalendarWidget variant="execution" />
                    </div>
                </div>
            </div>

            <FocusMode
                open={focusOpen}
                task={todayTask}
                onClose={() => setFocusOpen(false)}
                onComplete={handleFocusComplete}
            />

            <AIVoicePanel
                isOpen={voicePanelOpen}
                onClose={() => setVoicePanelOpen(false)}
                contextSource="dashboard"
            />
        </div>
    );
};

export default ExecutionDashboard;
