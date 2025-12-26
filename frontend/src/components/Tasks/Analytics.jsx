import React, { useState, useEffect } from 'react';
import { tasksService } from '../../api/tasksService';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await tasksService.getAnalytics();
            setAnalytics(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !analytics) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-400">Loading analytics...</p>
        </div>;
    }

    const statCards = [
        {
            title: 'Tasks Completed',
            value: analytics.completed_tasks,
            total: analytics.total_tasks,
            icon: '✓',
            color: 'green'
        },
        {
            title: 'Completion Rate',
            value: `${Math.round(analytics.completion_rate)}%`,
            icon: '📊',
            color: 'blue'
        },
        {
            title: 'Daily Streak',
            value: analytics.streak,
            suffix: 'days',
            icon: '🔥',
            color: 'orange'
        },
        {
            title: 'Study Time',
            value: Math.round(analytics.total_study_minutes / 60),
            suffix: 'hours',
            icon: '⏱️',
            color: 'purple'
        },
        {
            title: 'Today',
            value: analytics.today.completed,
            total: analytics.today.total,
            icon: '📅',
            color: 'indigo'
        },
        {
            title: 'This Week',
            value: analytics.this_week.completed,
            total: analytics.this_week.total,
            icon: '📈',
            color: 'pink'
        }
    ];

    const colorMap = {
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
        pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 md:p-10">
                <header className="mb-8">
                    <h1 className="text-3xl font-serif font-medium text-gray-900 dark:text-white mb-2">Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your learning progress and productivity</p>
                </header>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {statCards.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{stat.title}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </span>
                                        {stat.total && (
                                            <span className="text-gray-400">/ {stat.total}</span>
                                        )}
                                        {stat.suffix && (
                                            <span className="text-sm text-gray-400">{stat.suffix}</span>
                                        )}
                                    </div>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorMap[stat.color]}`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Revision Needed */}
                {analytics.revision_needed > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 mb-8">
                        <h3 className="font-medium text-yellow-900 dark:text-yellow-400 mb-2">
                            ⚠️ {analytics.revision_needed} task{analytics.revision_needed > 1 ? 's' : ''} need revision
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-500">
                            Review these tasks to reinforce your learning
                        </p>
                    </div>
                )}

                {/* Motivational Message */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-2">
                        {analytics.streak > 0 ? `🔥 ${analytics.streak} Day Streak!` : 'Start Your Journey!'}
                    </h2>
                    <p className="opacity-90">
                        {analytics.completion_rate > 75
                            ? "You're crushing it! Keep up the excellent work!"
                            : analytics.completion_rate > 50
                                ? "Great progress! You're on the right track."
                                : "Every small step counts. Keep going!"}
                    </p>
                </div>
            </div>
        </div>
    );
}
