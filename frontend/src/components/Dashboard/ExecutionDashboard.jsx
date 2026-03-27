import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import AIVoicePanel from '../Mentoring/AIVoicePanel';
import ModeSwitch from './Execution/ModeSwitch';

// New Architecture Components
import TodayExecution from './Execution/TodayExecution';
import FocusMode from './Execution/FocusMode';
import ExecutionFeed from './Execution/ExecutionFeed';
import ProgressPanel from './Execution/ProgressPanel';

import { useExecutionStore } from '../../store/useExecutionStore';
import { userService } from '../../api/userService';
import { roadmapService } from '../../api/roadmapService';
import { useMissionFlow } from '../../hooks/useMissionFlow';

const shellCardClass = 'rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-[#121212] dark:shadow-none';

const ExecutionDashboard = () => {
    const {
        mode,
        setMode,
        todayTask,
        coach,
        tasks,
        examTasks,
        progress,
        loading,
        bootstrap,
        regenerateCoach,
        currentState,
        setExecutionState,
        setTodayTask,
        createFocusSession,
        updateFocusSession,
        updateTaskStatus,
        applyRewards,
        refreshTodayTask
    } = useExecutionStore();

    const [profile, setProfile] = useState(null);
    const [voicePanelOpen, setVoicePanelOpen] = useState(false);

    // Legacy support for roadmaps/subjects to maintain routing
    const [roadmaps, setRoadmaps] = useState([]);
    const [activeTab, setActiveTab] = useState('activities');

    useEffect(() => {
        bootstrap();
        userService.getProfile().then(setProfile).catch(() => null);
        roadmapService.getUserRoadmaps().then(d => setRoadmaps(Array.isArray(d) ? d : []));
    }, [bootstrap]);

    // Use Mission Flow Hook for logic
    const { handleStartFocus, handleFocusComplete: originalComplete } = useMissionFlow({
        todayTask,
        createFocusSession,
        updateFocusSession,
        updateTaskStatus,
        applyRewards,
        refreshTodayTask
    });

    const onStartFocus = async () => {
        setExecutionState('IN_PROGRESS');
        await handleStartFocus();
    };

    const onComplete = async (minutes) => {
        await originalComplete(minutes);
        setExecutionState('COMPLETED');
        setTimeout(() => setExecutionState('NOT_STARTED'), 5000);
    };

    const onCloseFocus = () => {
        setExecutionState('NOT_STARTED');
    };

    const handleChangeTask = useCallback(async () => {
        const next = await regenerateCoach();
        if (next) {
            setTodayTask(prev => ({ ...prev, title: next.task, reason: next.reason, difficulty: next.difficulty, estimated_time: next.estimated_time }));
        }
    }, [regenerateCoach, setTodayTask]);

    const activeTasks = useMemo(() => mode === 'exam' ? examTasks : tasks, [mode, examTasks, tasks]);
    const streak = progress?.stats?.streak || progress?.stats?.current_streak || 0;

    // Additional Cards Logic (Paths/Subjects)
    const learningPathCards = useMemo(() => (roadmaps || []).slice(0, 3).map(r => ({
        key: r.id, tag: 'Path', title: r.title, subtitle: r.overview, ctaTo: `/roadmap/${r.id}`
    })), [roadmaps]);

    // Replace Exam Subjects with Pending Tasks (Day-wise carry over logic)
    const pendingTaskCards = useMemo(() => {
        const pending = (activeTasks || [])
            .filter(t => t.status !== 'completed')
            .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

        return pending.slice(0, 5).map(t => ({
            key: t.id,
            tag: 'Pending',
            title: t.title,
            subtitle: t.description || `Carried over from ${new Date(t.created_at || Date.now()).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}`,
            ctaTo: '#' // potentially open task details
        }));
    }, [activeTasks]);

    const displayCards = activeTab === 'paths' ? learningPathCards : pendingTaskCards;

    return (
        <div className={`min-h-screen text-slate-800 transition-colors duration-500 dark:text-slate-100 ${currentState === 'IN_PROGRESS' ? 'bg-[#050505]' : 'bg-[#F5F5F7] dark:bg-[#0b0b0b]'}`}>

            {/* Focus Mode Overlay */}
            <AnimatePresence>
                {currentState === 'IN_PROGRESS' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-sm"
                    >
                        <FocusMode
                            open={true}
                            task={todayTask}
                            onClose={onCloseFocus}
                            onComplete={onComplete}
                            embedded={true}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`mx-auto max-w-[1480px] p-4 transition-all duration-500 lg:p-6 ${currentState === 'IN_PROGRESS' ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>

                {/* 1. HERO SECTION */}
                <TodayExecution
                    user={profile}
                    todayTask={todayTask}
                    tasks={activeTasks}
                    streak={streak}
                    onStartFocus={onStartFocus}
                    onChangeTask={handleChangeTask}
                    loading={loading.bootstrap}
                />

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">

                    {/* LEFT COLUMN: Main Feed & Activities */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Mode Switcher Block */}
                        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#121212]">
                            <div className="flex items-center gap-4">
                                <ModeSwitch mode={mode} onChange={setMode} />
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {mode === 'learning' ? 'Learning Mode Active' : 'Exam Mode Active'}
                                </span>
                            </div>
                            <button
                                onClick={() => setVoicePanelOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                            >
                                <Sparkles className="h-3.5 w-3.5" /> AI Coach
                            </button>
                        </div>

                        {/* 4. EXECUTION FEED */}
                        <ExecutionFeed
                            tasks={activeTasks}
                            focusOpen={currentState === 'IN_PROGRESS'}
                            todayTask={todayTask}
                            streak={streak}
                        />

                        {/* Additional Activities (Paths/Subjects) */}
                        <div className={shellCardClass}>
                            <div className="mb-4 flex items-center gap-4 border-b border-slate-100 pb-2 dark:border-white/5">
                                <button onClick={() => setActiveTab('activities')} className={`pb-2 text-sm font-semibold ${activeTab === 'activities' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-slate-500'}`}>
                                    Pending Tasks
                                </button>
                                <button onClick={() => setActiveTab('paths')} className={`pb-2 text-sm font-semibold ${activeTab === 'paths' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-slate-500'}`}>
                                    Learning Paths
                                </button>
                            </div>

                            {activeTab === 'activities' && displayCards.length === 0 && (
                                <p className="text-sm text-slate-500">No pending tasks. You're all caught up!</p>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {displayCards.map(card => (
                                    <div key={card.key} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-white/5 dark:bg-[#181818] dark:hover:bg-[#202020]">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${card.tag === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300'}`}>
                                                {card.tag}
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">{card.title}</h4>
                                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{card.subtitle}</p>
                                        <Link to={card.ctaTo} className="absolute inset-0 flex items-end justify-end p-4 opacity-0 transition-opacity hover:opacity-100">
                                            <div className="rounded-full bg-white p-2 shadow-sm dark:bg-[#303030]">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Progress & AI */}
                    <aside className="space-y-6 lg:col-span-4">
                        {/* 5. PROGRESS PANEL */}
                        <ProgressPanel tasks={activeTasks} stats={progress?.stats} />

                        {/* AI Insight Card */}
                        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 dark:from-[#1a1a2e] dark:to-[#121212] dark:border-white/10">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <BrainCircuit className="h-5 w-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                {coach?.reason || "Consistency is your superpower. One focused session today beats zero."}
                            </p>
                            <button
                                onClick={() => setVoicePanelOpen(true)}
                                className="mt-4 w-full rounded-xl bg-indigo-100 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
                            >
                                Get Strategy
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            <AIVoicePanel
                isOpen={voicePanelOpen}
                onClose={() => setVoicePanelOpen(false)}
                contextSource="dashboard"
            />
        </div>
    );
};

export default ExecutionDashboard;
