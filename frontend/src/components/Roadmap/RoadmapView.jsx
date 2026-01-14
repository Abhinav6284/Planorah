import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { roadmapService } from "../../api/roadmapService";
import { tasksService } from "../../api/tasksService";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaRegCircle, FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaQuestionCircle, FaClock, FaTasks, FaRocket, FaCode, FaBook, FaLightbulb } from "react-icons/fa";

// Colorful milestone icons based on phase
const milestoneIcons = [
    { icon: FaBook, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: FaCode, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: FaRocket, color: 'from-orange-500 to-red-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { icon: FaLightbulb, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { icon: FaTasks, color: 'from-green-500 to-emerald-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: FaCheckCircle, color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
];

export default function RoadmapView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedMilestone, setExpandedMilestone] = useState(null);
    const [expandedFAQ, setExpandedFAQ] = useState(null);
    const [taskProgress, setTaskProgress] = useState({ total: 0, completed: 0 });

    useEffect(() => {
        fetchRoadmap();
        fetchTaskProgress();
    }, [id, fetchRoadmap, fetchTaskProgress]);

    const fetchRoadmap = useCallback(async () => {
        try {
            const data = await roadmapService.getRoadmapDetail(id);
            setRoadmap(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchTaskProgress = useCallback(async () => {
        try {
            const response = await tasksService.getTasks({ roadmap: id });
            const tasks = response.data || [];
            const completed = tasks.filter(t => t.status === 'completed').length;
            setTaskProgress({ total: tasks.length, completed });
        } catch (err) {
            console.error('Failed to fetch task progress:', err);
        }
    }, [id]);

    const toggleMilestone = (milestoneId) => {
        setExpandedMilestone(expandedMilestone === milestoneId ? null : milestoneId);
    };

    const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    const handleProgressUpdate = async (milestoneId, currentStatus) => {
        try {
            await roadmapService.updateMilestoneProgress(milestoneId, !currentStatus);
            fetchRoadmap(); // Refresh data
        } catch (err) {
            console.error(err);
        }
    };

    // Calculate overall progress
    const overallProgress = taskProgress.total > 0
        ? Math.round((taskProgress.completed / taskProgress.total) * 100)
        : 0;

    const completedMilestones = roadmap?.milestones?.filter(m => m.is_completed).length || 0;
    const totalMilestones = roadmap?.milestones?.length || 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-xl font-medium text-gray-400 animate-pulse">Loading your journey...</div>
                </div>
            </div>
        );
    }

    if (!roadmap) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 gap-4 transition-colors">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">Roadmap Not Found</div>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 md:p-12 font-sans transition-colors duration-200">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 ${roadmap.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        roadmap.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {roadmap.difficulty_level} Journey
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 dark:text-white mb-6">
                        {roadmap.title}
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 font-light mb-8 max-w-2xl mx-auto leading-relaxed">
                        {roadmap.overview}
                    </p>

                    {/* Progress Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8 max-w-xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{overallProgress}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${overallProgress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>{taskProgress.completed} / {taskProgress.total} tasks completed</span>
                            <span>{completedMilestones} / {totalMilestones} milestones</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-6 text-sm font-medium text-gray-400">
                        <div className="flex items-center gap-2">
                            <FaClock className="text-indigo-500" /> {roadmap.estimated_duration}
                        </div>
                        {roadmap.daily_commitment && (
                            <div className="flex items-center gap-2">
                                <span>🔥</span> {roadmap.daily_commitment}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <FaTasks className="text-green-500" /> {completedMilestones} / {totalMilestones} Milestones
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={() => navigate('/roadmap/list')}
                            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Go to Learning Path
                        </button>
                        <button
                            onClick={() => navigate('/tasks')}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            View Daily Tasks
                        </button>
                    </div>
                </motion.div>

                {/* Milestones Timeline */}
                <div className="relative space-y-6">
                    {/* Vertical Line - Left aligned */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-30" />

                    {roadmap.milestones.map((milestone, index) => {
                        const IconConfig = milestoneIcons[index % milestoneIcons.length];
                        const IconComponent = IconConfig.icon;

                        return (
                            <motion.div
                                key={milestone.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative pl-16"
                            >
                                {/* Timeline Dot - Left aligned */}
                                <div className={`absolute left-0 top-6 w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 shadow-lg z-10 flex items-center justify-center ${milestone.is_completed ? "bg-gradient-to-r from-green-400 to-emerald-500" : `bg-gradient-to-r ${IconConfig.color}`}`}>
                                    <IconComponent className="text-white text-sm" />
                                </div>

                                <div className={`border-2 rounded-2xl transition-all duration-300 overflow-hidden ${milestone.is_completed
                                    ? "border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800"
                                    }`}>
                                    {/* Milestone Header */}
                                    <div className="p-6 flex items-center gap-6">
                                        <button
                                            onClick={() => handleProgressUpdate(milestone.id, milestone.is_completed)}
                                            className={`text-3xl transition-transform hover:scale-110 ${milestone.is_completed ? "text-green-500" : "text-gray-300 dark:text-gray-600 hover:text-indigo-500"
                                                }`}
                                        >
                                            {milestone.is_completed ? <FaCheckCircle /> : <FaRegCircle />}
                                        </button>

                                        <div className="flex-1 cursor-pointer" onClick={() => toggleMilestone(milestone.id)}>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-gradient-to-r ${IconConfig.color} text-white`}>Phase {index + 1}</span>
                                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                                    <FaClock className="text-xs" /> {milestone.duration}
                                                </span>
                                            </div>
                                            <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${milestone.is_completed ? "line-through text-gray-400 dark:text-gray-500" : ""}`}>
                                                {milestone.title}
                                            </h3>
                                        </div>

                                        <button
                                            onClick={() => toggleMilestone(milestone.id)}
                                            className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                        >
                                            {expandedMilestone === milestone.id ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {expandedMilestone === milestone.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50"
                                            >
                                                <div className="p-8 space-y-8">
                                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">{milestone.description}</p>

                                                    {/* Topics / Skills */}
                                                    <div>
                                                        <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Key Concepts</h4>
                                                        <div className="grid gap-3">
                                                            {(milestone.topics || []).map((topic, i) => (
                                                                <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                                                                            {typeof topic === 'string' ? topic : topic.title}
                                                                        </span>
                                                                    </div>
                                                                    {typeof topic !== 'string' && topic.description && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-4 leading-relaxed">
                                                                            {topic.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Practice / Projects */}
                                                    {milestone.projects.length > 0 && (
                                                        <div>
                                                            <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Practical Application</h4>
                                                            <div className="grid gap-4">
                                                                {(milestone.projects || []).map((project) => (
                                                                    <div key={project.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <h5 className="font-bold text-lg text-gray-900 dark:text-white">{project.title}</h5>
                                                                            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${project.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                                project.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                                }`}>
                                                                                {project.difficulty}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{project.description}</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {(project.tech_stack || []).map((tech, t) => (
                                                                                <span key={t} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                                                                                    {tech}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Resources */}
                                                    {milestone.resources.length > 0 && (
                                                        <div>
                                                            <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Curated Resources</h4>
                                                            <div className="grid gap-3">
                                                                {(milestone.resources || []).map((resource, r) => (
                                                                    <a
                                                                        key={r}
                                                                        href={resource.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all group"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                                                                <FaExternalLinkAlt className="text-sm" />
                                                                            </div>
                                                                            <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{resource.title}</span>
                                                                        </div>
                                                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                                                                            {resource.type}
                                                                        </span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                {roadmap.faqs && roadmap.faqs.length > 0 && (
                    <div className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center flex items-center justify-center gap-3">
                            <FaQuestionCircle className="text-gray-300 dark:text-gray-600" />
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {roadmap.faqs.map((faq, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                                    >
                                        <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                                        <span className="text-gray-400 ml-4">
                                            {expandedFAQ === index ? <FaChevronUp /> : <FaChevronDown />}
                                        </span>
                                    </button>
                                    <AnimatePresence>
                                        {expandedFAQ === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700"
                                            >
                                                <div className="px-6 py-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
