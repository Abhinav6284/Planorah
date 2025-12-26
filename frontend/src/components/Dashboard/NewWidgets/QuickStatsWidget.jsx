import React from 'react';
import { motion } from 'framer-motion';

const QuickStatsWidget = ({ tasks = [] }) => {
    // Calculate overall stats
    const totalCompleted = tasks.filter(t => t.status === 'completed').length;
    const totalPending = tasks.filter(t => t.status !== 'completed').length;
    const uniqueRoadmaps = new Set(tasks.map(t => t.roadmap_title).filter(Boolean)).size;

    return (
        <div className="flex items-center gap-3">
            {/* Completed Pill */}
            <div className="h-12 px-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-all group shadow-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓</div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{totalCompleted}</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Completed</span>
                </div>
            </div>

            {/* Pending Pill */}
            <div className="h-12 px-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-all group shadow-sm">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{totalPending}</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Pending</span>
                </div>
            </div>

            {/* Roadmaps Pill */}
            <div className="h-12 px-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-all group shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{uniqueRoadmaps}</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Roadmaps</span>
                </div>
            </div>
        </div>
    );
};

export default QuickStatsWidget;
