import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const FocusMode = ({ open, task, onClose, onComplete, embedded = false }) => {
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

    const panel = (
        <>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Execution State</p>
                    <h3 className="text-xl font-semibold text-white">Focus Mode Active</h3>
                </div>
                <button onClick={onClose} className="text-sm text-slate-300 hover:text-white">End Session</button>
            </div>

            <p className="text-sm text-slate-300">Current Mission</p>
            <p className="mt-1 text-lg font-medium text-white">{task?.title || 'Deep work session'}</p>

            <div className="mt-5 flex gap-2">
                {[25, 50].map((option) => (
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        key={option}
                        onClick={() => setDuration(option)}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${duration === option
                            ? 'border-white/40 bg-white text-black'
                            : 'border-white/20 text-slate-200 hover:bg-white/10'
                            }`}
                    >
                        {option} min
                    </motion.button>
                ))}
            </div>

            <div className="mt-6">
                <div className="text-5xl font-bold tracking-tight text-white sm:text-6xl">{minutes}:{seconds}</div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-gradient-to-r from-white to-slate-300 transition-all" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">Distraction controls are active. Complete this mission to earn rewards.</p>
        </>
    );

    if (embedded) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mx-auto w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0f0f10] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            >
                {panel}
            </motion.div>
        );
    }

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0f0f10] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
                {panel}
            </motion.div>
        </div>
    );
};

export default FocusMode;
