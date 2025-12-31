import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { roadmapService } from '../../../api/roadmapService';
import { FaChevronRight, FaRocket } from 'react-icons/fa';

export default function RoadmapProgressWidget() {
    const navigate = useNavigate();
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoadmaps = async () => {
            try {
                const data = await roadmapService.getRoadmapProgress();
                setRoadmaps(data.slice(0, 3)); // Show top 3
            } catch (error) {
                console.error('Failed to fetch roadmap progress:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoadmaps();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#111] rounded-[32px] p-6 h-full shadow-sm">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'from-green-500 to-emerald-500';
        if (progress >= 50) return 'from-blue-500 to-indigo-500';
        if (progress >= 25) return 'from-yellow-500 to-orange-500';
        return 'from-gray-400 to-gray-500';
    };

    return (
        <div className="bg-white dark:bg-[#111] rounded-[32px] p-6 h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FaRocket className="text-indigo-500" />
                    Learning Progress
                </h3>
                <button
                    onClick={() => navigate('/roadmap/list')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                    View All <FaChevronRight className="text-xs" />
                </button>
            </div>

            {roadmaps.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        No roadmaps yet
                    </p>
                    <button
                        onClick={() => navigate('/roadmap/generate')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Generate Roadmap
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {roadmaps.map((roadmap, index) => (
                        <motion.div
                            key={roadmap.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate pr-2">
                                    {roadmap.title}
                                </h4>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {roadmap.progress}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full bg-gradient-to-r ${getProgressColor(roadmap.progress)} rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${roadmap.progress}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                />
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>{roadmap.completed_tasks}/{roadmap.total_tasks} tasks</span>
                                <span>{roadmap.completed_milestones}/{roadmap.total_milestones} milestones</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
