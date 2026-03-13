import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MESSAGES = [
    { delay: 0,    text: "Hey! I'm your AI Coach — built just for you. 👋" },
    { delay: 2600, text: "I've already looked at your goals and mapped your path forward." },
    { delay: 5400, text: "I'm always here — just tap the mic button anytime you need me." },
    { delay: 8200, text: "Let me show you around. Ready?" },
];

const TOUR_STEPS = [
    {
        path: "/dashboard",
        label: "Dashboard",
        hint: "This is your home base — your progress, tasks, and everything at a glance.",
    },
    {
        path: "/roadmap",
        label: "Roadmap",
        hint: "Your personal career roadmap lives here. Every topic, every milestone — step by step.",
    },
    {
        path: "/tasks",
        label: "Tasks",
        hint: "Your daily actions. Small steps here lead to big results.",
    },
    {
        path: "/resume",
        label: "Resume Builder",
        hint: "Build a standout resume with AI help — right here.",
    },
];

export default function WelcomeCoach({ userName = "", onDone }) {
    const navigate = useNavigate();
    const [phase, setPhase] = useState("intro"); // intro | tour | done
    const [visibleMessages, setVisibleMessages] = useState([]);
    const [tourIndex, setTourIndex] = useState(0);
    const [tourHintVisible, setTourHintVisible] = useState(false);
    const timersRef = useRef([]);

    // Queue intro messages
    useEffect(() => {
        if (phase !== "intro") return;
        const timers = timersRef.current;
        MESSAGES.forEach(({ delay, text }) => {
            const t = setTimeout(() => {
                setVisibleMessages(prev => [...prev, text]);
            }, delay);
            timers.push(t);
        });
        return () => timers.forEach(clearTimeout);
    }, [phase]);

    const handleStartTour = () => {
        setPhase("tour");
        setTourIndex(0);
        navigate(TOUR_STEPS[0].path);
        setTimeout(() => setTourHintVisible(true), 400);
    };

    const handleSkip = () => {
        sessionStorage.removeItem("show_welcome_coach");
        setPhase("done");
        onDone?.();
        navigate("/dashboard");
    };

    const handleNext = () => {
        const next = tourIndex + 1;
        if (next >= TOUR_STEPS.length) {
            sessionStorage.removeItem("show_welcome_coach");
            setPhase("done");
            onDone?.();
            navigate("/dashboard");
            return;
        }
        setTourHintVisible(false);
        setTimeout(() => {
            setTourIndex(next);
            navigate(TOUR_STEPS[next].path);
            setTimeout(() => setTourHintVisible(true), 400);
        }, 300);
    };

    if (phase === "done") return null;

    return (
        <AnimatePresence>
            {/* Full-screen blur backdrop */}
            <motion.div
                key="backdrop"
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ backdropFilter: "blur(18px)", backgroundColor: "rgba(10,10,20,0.55)" }}
            >
                {phase === "intro" && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-8 px-6 max-w-lg w-full text-center"
                    >
                        {/* Avatar pulse */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
                                <span className="text-4xl">🤖</span>
                            </div>
                            <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-20" />
                        </div>

                        {/* Greeting */}
                        {userName && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-white/60 text-sm tracking-widest uppercase"
                            >
                                Welcome, {userName}
                            </motion.p>
                        )}

                        {/* Typed messages */}
                        <div className="flex flex-col gap-3 min-h-[120px] items-center">
                            {visibleMessages.map((msg, i) => (
                                <motion.p
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className={`text-white font-medium leading-snug ${i === 0 ? "text-2xl" : "text-lg text-white/80"}`}
                                >
                                    {msg}
                                </motion.p>
                            ))}
                        </div>

                        {/* CTA buttons — appear after last message */}
                        <AnimatePresence>
                            {visibleMessages.length === MESSAGES.length && (
                                <motion.div
                                    key="cta"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex gap-3 flex-wrap justify-center"
                                >
                                    <button
                                        onClick={handleStartTour}
                                        className="px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl transition-all"
                                    >
                                        🚀 Take a Tour
                                    </button>
                                    <button
                                        onClick={handleSkip}
                                        className="px-7 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 font-medium text-base transition-all"
                                    >
                                        Skip for now
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {phase === "tour" && (
                    <motion.div
                        key={`tour-${tourIndex}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35 }}
                        className="flex flex-col items-center gap-6 px-6 max-w-md w-full text-center"
                    >
                        {/* Step indicator */}
                        <div className="flex gap-2">
                            {TOUR_STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all ${i === tourIndex ? "w-8 bg-indigo-400" : i < tourIndex ? "w-4 bg-white/40" : "w-4 bg-white/20"}`}
                                />
                            ))}
                        </div>

                        {/* Section label */}
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-xl">
                            {["🏠", "🗺️", "✅", "📄"][tourIndex]}
                        </div>

                        <h2 className="text-white text-2xl font-bold">{TOUR_STEPS[tourIndex].label}</h2>

                        <AnimatePresence>
                            {tourHintVisible && (
                                <motion.p
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-white/75 text-base leading-relaxed"
                                >
                                    {TOUR_STEPS[tourIndex].hint}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3 flex-wrap justify-center">
                            <button
                                onClick={handleNext}
                                className="px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl transition-all"
                            >
                                {tourIndex < TOUR_STEPS.length - 1 ? "Next →" : "Let's go! 🎉"}
                            </button>
                            <button
                                onClick={handleSkip}
                                className="px-7 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 font-medium text-base transition-all"
                            >
                                Skip tour
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
