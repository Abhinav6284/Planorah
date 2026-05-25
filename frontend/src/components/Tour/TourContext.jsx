import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const TOUR_STORAGE_KEY = 'planorah_tour_completed_v2';

export const TOUR_STEPS = [
    {
        id: 'welcome',
        target: null,
        title: 'Your student overview',
        description: 'Five quick stops. You will see where to start, what needs attention, and how to move fast from this screen.',
        position: 'center',
        icon: '✨',
    },
    {
        id: 'header-stats',
        target: '[data-tour="header-stats"]',
        title: 'Your momentum strip',
        description: 'This is the fastest health check: tasks done, focus time, and streak all in one glance.',
        position: 'bottom',
        icon: '📊',
    },
    {
        id: 'today-mission',
        target: '[data-tour="today-mission"]',
        title: 'Start here first',
        description: 'This is the main task the dashboard wants you to own now. If you only do one thing, do this.',
        position: 'bottom',
        icon: '🎯',
    },
    {
        id: 'schedule',
        target: '[data-tour="schedule"]',
        title: 'Your day map',
        description: 'Use this to see the shape of your day and spot the best time windows before you start moving.',
        position: 'top',
        icon: '🗓️',
    },
    {
        id: 'mode-switch',
        target: '[data-tour="mode-switch"]',
        title: 'Choose your mode',
        description: 'Switch the dashboard lens when you want a learning rhythm or a sharper execution rhythm.',
        position: 'bottom',
        icon: '🧭',
    },
    {
        id: 'progress-panel',
        target: '[data-tour="progress-panel"]',
        title: 'Measure the climb',
        description: 'Progress tells the story behind the numbers so you can see momentum, not just tasks.',
        position: 'left',
        icon: '📈',
    },
    {
        id: 'ai-coach-btn',
        target: '[data-tour="ai-coach-btn"]',
        title: 'Ask the coach',
        description: 'Open this when you want a second brain. It is the quickest way to turn confusion into a next step.',
        position: 'top',
        icon: '🤖',
    },
    {
        id: 'ai-insight',
        target: '[data-tour="ai-insight"]',
        title: 'What should happen next',
        description: 'This card surfaces the next move and why it matters so the overview stays clear and actionable.',
        position: 'left',
        icon: '💡',
    },
    {
        id: 'done',
        target: null,
        title: "You're set",
        description: 'You now know where to look, where to act, and where to ask for help. You can close this and start.',
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
