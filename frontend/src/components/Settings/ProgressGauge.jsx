import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressGauge({ percentage, label, size = 'md' }) {
    const sizes = {
        sm: { width: 80, stroke: 6, text: 'text-xl' },
        md: { width: 120, stroke: 8, text: 'text-3xl' },
        lg: { width: 160, stroke: 10, text: 'text-4xl' },
    };

    const { width, stroke, text } = sizes[size];
    const radius = (width - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width, height: width }}>
                <svg width={width} height={width} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="none"
                        className="text-gray-200 dark:text-gray-800"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{
                            strokeDasharray: circumference,
                        }}
                        className="text-gray-900 dark:text-white"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`${text} font-bold text-gray-900 dark:text-white`}>
                        {Math.round(percentage)}%
                    </span>
                </div>
            </div>
            {label && (
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                    {label}
                </div>
            )}
        </div>
    );
}
