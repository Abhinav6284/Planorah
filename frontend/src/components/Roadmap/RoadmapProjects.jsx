import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roadmapService } from '../../api/roadmapService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCode, FaClock, FaLayerGroup, FaCheckCircle, FaPlayCircle, FaCircle,
    FaChevronDown, FaChevronUp, FaTasks, FaRocket,
    FaExternalLinkAlt, FaGithub, FaLightbulb, FaListUl, FaArrowRight
} from 'react-icons/fa';

export default function RoadmapProjects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [roadmapFilter, setRoadmapFilter] = useState('all');
    const [roadmaps, setRoadmaps] = useState([]);
    const [expandedProject, setExpandedProject] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [projectsData, roadmapsData] = await Promise.all([
                roadmapService.getRoadmapProjects(),
                roadmapService.getUserRoadmaps()
            ]);
            setProjects(projectsData);
            setRoadmaps(roadmapsData);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const statusMatch = filter === 'all' || project.status === filter;
        const roadmapMatch = roadmapFilter === 'all' || project.roadmap_id === parseInt(roadmapFilter, 10);
        return statusMatch && roadmapMatch;
    });

    // Toggle expanded project
    const toggleExpand = (projectId) => {
        setExpandedProject(expandedProject === projectId ? null : projectId);
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <FaCheckCircle className="text-green-500" />;
            case 'in_progress':
                return <FaPlayCircle className="text-blue-500" />;
            default:
                return <FaCircle className="text-gray-400" />;
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const styles = {
            'completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            'in_progress': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'not_started': 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        };
        const labels = {
            'completed': 'Completed',
            'in_progress': 'In Progress',
            'not_started': 'Not Started'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    // Get difficulty badge
    const getDifficultyBadge = (difficulty) => {
        const styles = {
            'easy': 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
            'medium': 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
            'hard': 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
        };
        return (
            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${styles[difficulty]}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
        );
    };

    // Calculate stats
    const stats = {
        total: projects.length,
        completed: projects.filter(p => p.status === 'completed').length,
        inProgress: projects.filter(p => p.status === 'in_progress').length,
        notStarted: projects.filter(p => p.status === 'not_started').length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 dark:text-white mb-2">
                        My Projects
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Track your project progress from your learning roadmaps
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
                    >
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Projects</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
                    >
                        <p className="text-sm text-green-600 dark:text-green-400 mb-1">Completed</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
                    >
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">In Progress</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
                    >
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Not Started</p>
                        <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{stats.notStarted}</p>
                    </motion.div>
                </div>

                {/* Connect to GitHub Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 mb-8 border border-gray-700"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                <FaGithub className="text-2xl text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Connect to GitHub</h3>
                                <p className="text-sm text-gray-400">Push your projects directly to GitHub repositories</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href="https://github.com/new"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                <FaRocket className="text-xs" />
                                New Repository
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium text-sm hover:bg-gray-600 transition-colors flex items-center gap-2"
                            >
                                <FaExternalLinkAlt className="text-xs" />
                                Open GitHub
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Status Filter */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['all', 'not_started', 'in_progress', 'completed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === status
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {status === 'all' ? 'All' : status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Roadmap Filter */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Roadmap
                            </label>
                            <select
                                value={roadmapFilter}
                                onChange={(e) => setRoadmapFilter(e.target.value)}
                                className="w-full md:w-auto px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                            >
                                <option value="all">All Roadmaps</option>
                                {roadmaps.map(roadmap => (
                                    <option key={roadmap.id} value={roadmap.id}>
                                        {roadmap.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Projects List */}
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FaCode className="text-2xl text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {projects.length === 0
                                ? 'Generate a roadmap to get started with projects!'
                                : 'No projects match your current filters.'}
                        </p>
                        {projects.length === 0 && (
                            <button
                                onClick={() => navigate('/roadmap/generate')}
                                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:opacity-90 transition-all"
                            >
                                Generate Roadmap
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProjects.map((project, index) => {
                            const isExpanded = expandedProject === `${project.roadmap_id}-${project.id}`;
                            const projectKey = `${project.roadmap_id}-${project.id}`;

                            return (
                                <motion.div
                                    key={projectKey}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-white dark:bg-gray-800 rounded-2xl border ${isExpanded ? 'border-blue-300 dark:border-blue-600 shadow-lg' : 'border-gray-100 dark:border-gray-700'} overflow-hidden transition-all duration-300`}
                                >
                                    {/* Progress Bar */}
                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700">
                                        <div
                                            className={`h-full transition-all duration-500 ${project.status === 'completed' ? 'bg-green-500' :
                                                project.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>

                                    {/* Main Card Content - Clickable */}
                                    <div
                                        className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                        onClick={() => toggleExpand(projectKey)}
                                    >
                                        <div className="flex items-start justify-between">
                                            {/* Left Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Header */}
                                                <div className="flex items-center gap-3 mb-2">
                                                    {getStatusIcon(project.status)}
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                                                        {project.title}
                                                    </h3>
                                                    {getDifficultyBadge(project.difficulty)}
                                                </div>

                                                {/* Description */}
                                                <p className={`text-sm text-gray-600 dark:text-gray-400 mb-3 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                                    {project.description}
                                                </p>

                                                {/* Quick Info Row */}
                                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                        <FaLayerGroup className="text-xs" />
                                                        <span className="truncate max-w-[150px]">{project.roadmap_title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                        <FaClock className="text-xs" />
                                                        <span>{project.estimated_hours}h estimated</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                        <FaTasks className="text-xs" />
                                                        <span>{project.completed_tasks}/{project.total_tasks} tasks</span>
                                                    </div>
                                                    {getStatusBadge(project.status)}
                                                </div>
                                            </div>

                                            {/* Right Side - Progress & Expand */}
                                            <div className="flex items-center gap-4 ml-4">
                                                {/* Circular Progress */}
                                                <div className="relative w-14 h-14 hidden md:block">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle
                                                            cx="28"
                                                            cy="28"
                                                            r="24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                            className="text-gray-200 dark:text-gray-700"
                                                        />
                                                        <circle
                                                            cx="28"
                                                            cy="28"
                                                            r="24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                            strokeLinecap="round"
                                                            strokeDasharray={`${project.progress * 1.51} 151`}
                                                            className={project.status === 'completed' ? 'text-green-500' : project.status === 'in_progress' ? 'text-blue-500' : 'text-gray-400'}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{project.progress}%</span>
                                                    </div>
                                                </div>

                                                {/* Expand Button */}
                                                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                    {isExpanded ?
                                                        <FaChevronUp className="text-gray-500 dark:text-gray-400" /> :
                                                        <FaChevronDown className="text-gray-500 dark:text-gray-400" />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {/* Tech Stack Section */}
                                                        <div className="space-y-3">
                                                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                                                <FaCode className="text-blue-500" />
                                                                Tech Stack
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {project.tech_stack && project.tech_stack.length > 0 ? (
                                                                    project.tech_stack.map((tech, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-medium border border-indigo-100 dark:border-indigo-800"
                                                                        >
                                                                            {tech}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-sm text-gray-500 dark:text-gray-400">No tech stack specified</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Project Details */}
                                                        <div className="space-y-3">
                                                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                                                <FaListUl className="text-purple-500" />
                                                                Project Details
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                                                    <span className="text-gray-500 dark:text-gray-400">Phase:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white">{project.milestone_title}</span>
                                                                </div>
                                                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                                                    <span className="text-gray-500 dark:text-gray-400">Estimated Time:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white">{project.estimated_hours} hours</span>
                                                                </div>
                                                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                                                    <span className="text-gray-500 dark:text-gray-400">Tasks Completed:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white">{project.completed_tasks} / {project.total_tasks}</span>
                                                                </div>
                                                                <div className="flex justify-between py-2">
                                                                    <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
                                                                    {getDifficultyBadge(project.difficulty)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Quick Actions */}
                                                        <div className="space-y-3">
                                                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                                                <FaRocket className="text-orange-500" />
                                                                Quick Actions
                                                            </h4>
                                                            <div className="space-y-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/tasks?roadmap=${project.roadmap_id}`);
                                                                    }}
                                                                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                                                                >
                                                                    <span className="flex items-center gap-2">
                                                                        <FaTasks />
                                                                        View Tasks
                                                                    </span>
                                                                    <FaArrowRight />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/roadmap/${project.roadmap_id}`);
                                                                    }}
                                                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                                                >
                                                                    <span className="flex items-center gap-2">
                                                                        <FaLayerGroup />
                                                                        View Roadmap
                                                                    </span>
                                                                    <FaArrowRight />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate('/codespace');
                                                                    }}
                                                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                                                >
                                                                    <span className="flex items-center gap-2">
                                                                        <FaCode />
                                                                        Open CodeSpace
                                                                    </span>
                                                                    <FaArrowRight />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // Create GitHub repo URL with project title as suggested name
                                                                        const repoName = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                                                        window.open(`https://github.com/new?name=${repoName}&description=${encodeURIComponent(project.description || '')}`, '_blank');
                                                                    }}
                                                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-white transition-all"
                                                                >
                                                                    <span className="flex items-center gap-2">
                                                                        <FaGithub />
                                                                        Push to GitHub
                                                                    </span>
                                                                    <FaExternalLinkAlt className="text-xs" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Learning Tips Section */}
                                                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2">
                                                            <FaLightbulb className="text-amber-500" />
                                                            Pro Tip
                                                        </h4>
                                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                                            {project.status === 'not_started'
                                                                ? "Ready to start? Break down this project into smaller tasks and set daily goals. Start with the basics and gradually build up complexity."
                                                                : project.status === 'in_progress'
                                                                    ? "Great progress! Keep the momentum going. Consider documenting your code as you build - it helps with learning and future reference."
                                                                    : "Congratulations on completing this project! Consider adding it to your portfolio and sharing your learnings with the community."
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
