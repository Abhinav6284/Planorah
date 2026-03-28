import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useToast } from '../components/common/Toast';

export const useMissionFlow = ({
    todayTask,
    createFocusSession,
    updateFocusSession,
    updateTaskStatus,
    applyRewards,
    refreshTodayTask,
}) => {
    const toast = useToast();
    const [focusOpen, setFocusOpen] = useState(false);
    const [focusSession, setFocusSession] = useState(null);
    const [rewardPulse, setRewardPulse] = useState(null);
    const [activeTask, setActiveTask] = useState(todayTask || null);

    useEffect(() => {
        if (todayTask?.id) {
            setActiveTask(todayTask);
        }
    }, [todayTask]);

    const handleStartFocus = useCallback(async (taskOverride = null) => {
        const taskToFocus = taskOverride || todayTask;
        if (!taskToFocus?.id) return;

        try {
            setActiveTask(taskToFocus);
            const plannedMinutes = Number(taskToFocus?.estimated_minutes) || 25;
            const session = await createFocusSession({ task: taskToFocus.id, planned_minutes: plannedMinutes });
            setFocusSession(session);
            setFocusOpen(true);
        } catch (error) {
            toast.error('Unable to start focus mode. Please retry.');
        }
    }, [todayTask, createFocusSession, toast]);

    const handleFocusComplete = useCallback(async (minutes) => {
        const taskToComplete = activeTask || todayTask;

        try {
            if (focusSession?.id) {
                await updateFocusSession({ id: focusSession.id, status: 'completed', actual_minutes: minutes });
            }

            if (taskToComplete?.id) {
                await updateTaskStatus(taskToComplete.id, 'completed');
                const reward = await applyRewards(taskToComplete.id);
                const xp = reward?.xp_gain || 0;
                const streak = reward?.stats?.current_streak || 0;
                const level = reward?.stats?.level || 'Beginner';

                setRewardPulse({ xp, streak, level });
                setTimeout(() => setRewardPulse(null), 1800);

                if (xp > 0) {
                    confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } });
                    toast.success(`+${xp} XP earned • Streak ${streak} days • Level ${level}`);
                } else {
                    toast.info('Mission completed. Rewards already applied.');
                }
            }

            await refreshTodayTask();
        } catch (error) {
            toast.error('Could not complete this mission. Try again.');
        } finally {
            setFocusOpen(false);
            setFocusSession(null);
            setActiveTask(null);
        }
    }, [focusSession, activeTask, todayTask, updateFocusSession, updateTaskStatus, applyRewards, refreshTodayTask, toast]);

    return {
        focusOpen,
        setFocusOpen,
        rewardPulse,
        handleStartFocus,
        handleFocusComplete,
    };
};
