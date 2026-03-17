import React from 'react';
import { motion } from 'framer-motion';

const ProgressChartWidget = ({ data = [] }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = [...Array(7)].map((_, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - index));
        return {
            date: date.toISOString().split('T')[0],
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            isToday: index === 6,
        };
    });

    const chartData = last7Days.map((dayInfo) => {
        const dayTasks = data.filter((task) => {
            if (!task.completed_at) return false;
            return task.completed_at.startsWith(dayInfo.date);
        });

        const completedCount = dayTasks.length;
        const value = Math.min((completedCount / 5) * 100, 100);

        return {
            day: dayInfo.day,
            value,
            count: completedCount,
            isToday: dayInfo.isToday,
        };
    });

    const totalCompleted = chartData.reduce((sum, item) => sum + item.count, 0);
    const avgValue = chartData.length > 0
        ? Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)
        : 0;

    return (
        <div className="h-full rounded-[20px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_10px_18px_-12px_rgba(37,99,235,0.85)]">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v8m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V7a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Weekly Progress</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{totalCompleted} completed this week</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-2xl font-semibold text-blue-600 dark:text-blue-300">{avgValue}%</p>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">avg completion</p>
                </div>
            </div>

            <div className="flex min-h-[120px] items-end gap-2.5">
                {chartData.map((item, index) => {
                    const displayHeight = item.value > 0 ? Math.max(item.value, 16) : 10;

                    return (
                        <motion.div
                            key={index}
                            whileHover={{ y: -2 }}
                            className="group flex flex-1 flex-col items-center gap-2"
                        >
                            <div className="relative flex h-full w-full items-end justify-center">
                                <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-700">
                                    {item.count} task{item.count !== 1 ? 's' : ''}
                                </div>

                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${displayHeight}%` }}
                                    transition={{ duration: 0.55, delay: index * 0.04, ease: 'easeOut' }}
                                    className={`w-full max-w-[34px] rounded-lg border transition-all duration-300 ${item.isToday
                                        ? 'border-orange-300 bg-gradient-to-t from-orange-500 to-orange-400 shadow-[0_10px_18px_-12px_rgba(249,115,22,0.7)]'
                                        : item.count > 0
                                            ? 'border-blue-300 bg-gradient-to-t from-blue-600 to-blue-500 shadow-[0_10px_18px_-12px_rgba(37,99,235,0.7)]'
                                            : 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
                                        } group-hover:scale-[1.03]`}
                                />
                            </div>

                            <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${item.isToday
                                ? 'text-orange-600 dark:text-orange-300'
                                : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                {item.day}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center justify-center gap-5 border-t border-slate-200 pt-3 text-xs dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-500 dark:text-slate-400">Completed days</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    <span className="text-slate-500 dark:text-slate-400">Today</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressChartWidget;
