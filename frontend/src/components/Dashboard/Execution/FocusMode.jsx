import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const FocusMode = ({ open, task, onClose, onComplete }) => {
    const [duration, setDuration] = useState(25);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);

    const totalSeconds = useMemo(() => duration * 60, [duration]);

    useEffect(() => {
        if (!open) return;
        setSecondsLeft(duration * 60);
    }, [open, duration]);

    useEffect(() => {
        if (!open || secondsLeft <= 0) return;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [open, secondsLeft]);

    useEffect(() => {
        if (open && secondsLeft === 0) {
            onComplete(duration);
        }
    }, [open, secondsLeft, duration, onComplete]);

    if (!open) return null;

    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const seconds = String(secondsLeft % 60).padStart(2, '0');
    const progress = Math.max(0, Math.min(100, ((totalSeconds - secondsLeft) / totalSeconds) * 100));

    return (
        <div className="fixed inset-0 z-[130] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-2xl rounded-3xl border border-cyan-300/35 bg-[#07121b] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Execution State</p>
                        <h3 className="text-xl font-semibold">Focus Mode Active</h3>
                    </div>
                    <button onClick={onClose} className="text-sm text-slate-300 hover:text-white">End Session</button>
                </div>

                <p className="text-sm text-slate-300">Current Mission</p>
                <p className="text-lg mt-1 font-medium">{task?.title || 'Deep work session'}</p>

                <div className="mt-5 flex gap-2">
                    {[25, 50].map((option) => (
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            key={option}
                            onClick={() => setDuration(option)}
                            className={`px-3 py-1.5 rounded-lg text-sm border ${duration === option
                                ? 'bg-cyan-300 text-[#062231] border-cyan-200'
                                : 'border-white/20 text-slate-200 hover:bg-white/10'
                                }`}
                        >
                            {option} min
                        </motion.button>
                    ))}
                </div>

                <div className="mt-6">
                    <div className="text-5xl sm:text-6xl font-bold tracking-tight">{minutes}:{seconds}</div>
                    <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-300 to-teal-300 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <p className="mt-4 text-xs text-slate-400">Distraction controls are active. Complete this mission to earn rewards.</p>
            </motion.div>
        </div>
    );
};

export default FocusMode;
