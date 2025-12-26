import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PomodoroTimer({ taskId, estimatedMinutes }) {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    useEffect(() => {
        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        // Timer finished
                        setIsActive(false);
                        if (isBreak) {
                            // Break finished, start work
                            setMinutes(25);
                            setIsBreak(false);
                        } else {
                            // Work finished, start break
                            setMinutes(5);
                            setIsBreak(true);
                        }
                        // Play notification sound
                        playNotification();
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, minutes, seconds, isBreak]);

    const playNotification = () => {
        // Simple beep using Audio API
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setMinutes(25);
        setSeconds(0);
        setIsBreak(false);
    };

    const progress = ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

    return (
        <div className="flex flex-col items-center">
            {/* Timer Display */}
            <div className="relative w-64 h-64">
                {/* Progress Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                    />
                    <motion.circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className={isBreak ? "text-green-500" : "text-blue-500"}
                        strokeDasharray={2 * Math.PI * 120}
                        initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
                        transition={{ duration: 0.5 }}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Time */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-6xl font-bold text-gray-900 dark:text-white">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {isBreak ? 'Break Time' : 'Focus Time'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-8">
                <button
                    onClick={toggleTimer}
                    className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:opacity-80 transition-all"
                >
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={resetTimer}
                    className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
