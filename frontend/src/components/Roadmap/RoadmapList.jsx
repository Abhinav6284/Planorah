import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { roadmapService } from "../../api/roadmapService";
import { motion } from "framer-motion";
import { FaPlus, FaTrash, FaMapMarkedAlt, FaClock, FaCalendarAlt } from "react-icons/fa";

export default function RoadmapList() {
    const navigate = useNavigate();
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const fetchRoadmaps = async () => {
        try {
            const data = await roadmapService.getUserRoadmaps();
            setRoadmaps(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this roadmap?")) {
            try {
                await roadmapService.deleteRoadmap(id);
                fetchRoadmaps();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="p-8 md:p-12 max-w-7xl mx-auto font-sans overflow-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-serif font-medium text-gray-900 dark:text-white mb-2">My Learning Paths</h2>
                        <p className="text-gray-500 dark:text-gray-400">Track your progress and achieve your goals.</p>
                    </div>
                    <button
                        onClick={() => navigate("/roadmap/generate")}
                        className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg shadow-black/10 dark:shadow-white/10 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <FaPlus className="text-sm" />
                        <span>New Path</span>
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : roadmaps.length === 0 ? (
                    <div className="text-center py-32 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 border-dashed">
                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <FaMapMarkedAlt className="text-2xl text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-serif font-medium text-gray-900 dark:text-white mb-2">No roadmaps yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Start your learning journey by creating a personalized roadmap powered by AI.</p>
                        <button
                            onClick={() => navigate("/roadmap/generate")}
                            className="px-8 py-3 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Create First Roadmap
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roadmaps.map((roadmap, index) => (
                            <motion.div
                                key={roadmap.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                                className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={(e) => handleDelete(e, roadmap.id)}
                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 text-red-500 rounded-full shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium tracking-wide mb-4 ${roadmap.difficulty_level === 'beginner' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                        roadmap.difficulty_level === 'intermediate' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        }`}>
                                        {roadmap.difficulty_level.charAt(0).toUpperCase() + roadmap.difficulty_level.slice(1)}
                                    </span>
                                    <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {roadmap.title}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                                        {roadmap.overview}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                                        <FaClock />
                                        <span>{roadmap.estimated_duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                                        <FaCalendarAlt />
                                        <span>{new Date(roadmap.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
