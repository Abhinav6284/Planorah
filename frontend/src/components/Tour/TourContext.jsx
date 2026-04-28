import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const TOUR_STORAGE_KEY = 'planorah_tour_completed_v1';

export const TOUR_STEPS = [
    {
        id: 'welcome',
        target: null,
        title: 'Welcome to Planorah',
        description: "Let's explore your command center. We'll show you your sidebar navigation and main dashboard in just 30 seconds.",
        position: 'center',
        icon: '👋',
    },
    // Sidebar - LEARN section
    {
        id: 'sidebar-virtuallab',
        target: 'a[href="/lab"]',
        title: '🔬 Virtual Lab',
        description: 'Hands-on experiments and coding. Build projects, run simulations, and learn by doing.',
        position: 'right',
        icon: '🔬',
    },
    {
        id: 'sidebar-learningpath',
        target: 'a[href="/roadmap/list"]',
        title: '🗺️ Learning Path',
        description: 'AI-generated roadmaps that break down your learning into manageable milestones.',
        position: 'right',
        icon: '🗺️',
    },
    {
        id: 'sidebar-myprojects',
        target: 'a[href="/roadmap/projects"]',
        title: '⚙️ My Projects',
        description: 'Build and showcase your best work. Track project progress and milestones.',
        position: 'right',
        icon: '⚙️',
    },
    {
        id: 'sidebar-studyplatform',
        target: 'a[href="/planora"]',
        title: '📚 Study Platform',
        description: 'Smart study material organization. Generate notes, summaries, and study guides with AI.',
        position: 'right',
        icon: '📚',
    },
    // Sidebar - CAREER section
    {
        id: 'sidebar-resumebuilder',
        target: 'a[href="/resume"]',
        title: '📄 Resume Builder',
        description: 'Create and optimize your resume. AI-powered suggestions for impact.',
        position: 'right',
        icon: '📄',
    },
    {
        id: 'sidebar-compiledresumes',
        target: 'a[href="/resume/compiled"]',
        title: '📋 Compiled Resumes',
        description: 'ATS-optimized resume versions. Check compatibility and improve scores.',
        position: 'right',
        icon: '📋',
    },
    {
        id: 'sidebar-jobfinder',
        target: 'a[href="/ats"]',
        title: '🎯 Find Your Fit',
        description: 'AI job matching. Find roles that align with your skills and goals.',
        position: 'right',
        icon: '🎯',
    },
    {
        id: 'sidebar-mockinterview',
        target: 'a[href="/interview"]',
        title: '🎤 Mock Interview',
        description: 'Practice interviews with AI feedback. Build confidence before the real thing.',
        position: 'right',
        icon: '🎤',
    },
    // Dashboard
    {
        id: 'header-stats',
        target: '[data-tour="header-stats"]',
        title: 'Your Daily Snapshot',
        description: 'Tasks done, focus hours, and your streak. Everything updates in real-time.',
        position: 'bottom',
        icon: '📊',
    },
    {
        id: 'today-mission',
        target: '[data-tour="today-mission"]',
        title: "Today's Mission",
        description: 'Your top priority task. AI-picked based on your goals and progress.',
        position: 'bottom',
        icon: '🎯',
    },
    {
        id: 'done',
        target: null,
        title: "You're all set!",
        description: "Explore the sidebar to navigate. Use your AI Mentor widget for help anytime. Let's go!",
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
