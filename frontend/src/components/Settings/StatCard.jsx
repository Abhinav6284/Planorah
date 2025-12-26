import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, subtitle, color = 'blue', trend }) {
    const colorClasses = {
        blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400',
        purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400',
        green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-600 dark:text-green-400',
        orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-600 dark:text-orange-400',
        indigo: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border rounded-2xl p-6 hover:scale-105 transition-transform duration-300`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</div>
                    <div className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</div>
                    {subtitle && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>
                    )}
                </div>
                <div className={`text-3xl opacity-60`}>{icon}</div>
            </div>
            {trend && (
                <div className={`text-xs mt-3 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
                </div>
            )}
        </motion.div>
    );
}
