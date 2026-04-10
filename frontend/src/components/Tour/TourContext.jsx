import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const TOUR_STORAGE_KEY = 'planorah_tour_completed_v1';

export const TOUR_STEPS = [
    {
        id: 'welcome',
        target: null,
        title: 'Welcome to Planorah',
        description: "You're about to get a quick tour of your command center. We'll show you exactly where everything lives — from your daily mission to AI-powered insights. Takes about 60 seconds.",
        position: 'center',
        icon: '👋',
    },
    {
        id: 'header-stats',
        target: '[data-tour="header-stats"]',
        title: 'Your Daily Snapshot',
        description: 'At a glance: tasks completed today, focus hours tracked, efficiency rate, and your streak. These stats update in real-time as you complete sessions.',
        position: 'bottom',
        icon: '📊',
    },
    {
        id: 'today-mission',
        target: '[data-tour="today-mission"]',
        title: "Today's Mission",
        description: "Your AI coach picks the single most important task for today based on your roadmap and current progress. Hit Start to enter deep focus mode — no distractions.",
        position: 'bottom',
        icon: '🎯',
    },
    {
        id: 'mode-switch',
        target: '[data-tour="mode-switch"]',
        title: 'Learning vs Exam Mode',
        description: "Switch between Learning Mode (roadmap-driven tasks) and Exam Mode (subject-focused study). The entire dashboard adapts — tasks, roadmaps, and subjects all change accordingly.",
        position: 'bottom',
        icon: '🔀',
    },
    {
        id: 'ai-coach-btn',
        target: '[data-tour="ai-coach-btn"]',
        title: 'Your AI Coach',
        description: "Open your AI voice coach right here. Ask anything — what to study next, how to break down a hard concept, or get a strategy session to plan your week.",
        position: 'bottom',
        icon: '🤖',
    },
    {
        id: 'schedule',
        target: '[data-tour="schedule"]',
        title: 'Task Schedule',
        description: "Browse your tasks day by day using the date strip. Tap any date to see what's planned. Click a task row to open a full step-by-step guide for that task.",
        position: 'top',
        icon: '📅',
    },
    {
        id: 'linked-section',
        target: '[data-tour="linked-section"]',
        title: 'Roadmaps & Subjects',
        description: "In Learning Mode: your AI-generated roadmaps. In Exam Mode: your study subjects and topics. Everything is linked to tasks so progress flows automatically.",
        position: 'top',
        icon: '🗺️',
    },
    {
        id: 'execution-feed',
        target: '[data-tour="execution-feed"]',
        title: 'Activity Feed',
        description: "Your proof-of-work. See recent task completions, streaks, and today's momentum. Every focus session gets logged here automatically.",
        position: 'left',
        icon: '⚡',
    },
    {
        id: 'progress-panel',
        target: '[data-tour="progress-panel"]',
        title: 'Progress Panel',
        description: "XP points, current level, and your activity heatmap. Watch your skill level climb as you complete sessions and maintain your streak.",
        position: 'left',
        icon: '📈',
    },
    {
        id: 'ai-insight',
        target: '[data-tour="ai-insight"]',
        title: 'AI Insight',
        description: "Personalized strategy from your AI coach based on your current trajectory. Click 'Get Strategy' to open a deeper coaching conversation.",
        position: 'left',
        icon: '💡',
    },
    {
        id: 'done',
        target: null,
        title: "You're all set!",
        description: "That's your full command center. Start with today's mission, stay in the zone with focus mode, and let your AI coach guide you when you're stuck. Let's build something great.",
        position: 'center',
        icon: '🚀',
    },
];

const TourContext = createContext(null);

export function TourProvider({ children }) {
    const [active, setActive] = useState(false);
    const [step, setStep] = useState(0);

    // Auto-start on first dashboard visit
    useEffect(() => {
        const completed = localStorage.getItem(TOUR_STORAGE_KEY);
        if (!completed) {
            const timer = setTimeout(() => setActive(true), 1400);
            return () => clearTimeout(timer);
        }
    }, []);

    const start = useCallback(() => {
        setStep(0);
        setActive(true);
    }, []);

    const next = useCallback(() => {
        setStep(prev => {
            const nextStep = prev + 1;
            if (nextStep >= TOUR_STEPS.length) {
                setActive(false);
                localStorage.setItem(TOUR_STORAGE_KEY, '1');
                return 0;
            }
            return nextStep;
        });
    }, []);

    const back = useCallback(() => {
        setStep(prev => Math.max(0, prev - 1));
    }, []);

    const skip = useCallback(() => {
        setActive(false);
        localStorage.setItem(TOUR_STORAGE_KEY, '1');
        setStep(0);
    }, []);

    return (
        <TourContext.Provider value={{ active, step, start, next, back, skip, totalSteps: TOUR_STEPS.length }}>
            {children}
        </TourContext.Provider>
    );
}

export const useTour = () => useContext(TourContext);
