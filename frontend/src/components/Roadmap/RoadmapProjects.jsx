import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roadmapService } from '../../api/roadmapService';
import { motion } from 'framer-motion';
import { FaCode, FaClock, FaLayerGroup, FaCheckCircle, FaPlayCircle, FaCircle } from 'react-icons/fa';

export default function RoadmapProjects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [roadmapFilter, setRoadmapFilter] = useState('all');
    const [roadmaps, setRoadmaps] = useState([]);

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
        const roadmapMatch = roadmapFilter === 'all' || project.roadmap_id === parseInt(roadmapFilter);
        return statusMatch && roadmapMatch;
    });

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
                <div className="text-gray-500 dark:text-gray-400 animate-pulse">Loading projects...</div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project, index) => (
                            <motion.div
                                key={`${project.roadmap_id}-${project.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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

                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(project.status)}
                                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                                                {project.title}
                                            </h3>
                                        </div>
                                        {getDifficultyBadge(project.difficulty)}
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {project.description}
                                    </p>

                                    {/* Roadmap Info */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        <FaLayerGroup />
                                        <span className="truncate">{project.roadmap_title}</span>
                                        <span>•</span>
                                        <span className="truncate">{project.milestone_title}</span>
                                    </div>

                                    {/* Tech Stack */}
                                    {project.tech_stack && project.tech_stack.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {project.tech_stack.slice(0, 4).map((tech, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded text-xs font-medium"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                            {project.tech_stack.length > 4 && (
                                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                                                    +{project.tech_stack.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <FaClock />
                                                {project.estimated_hours}h
                                            </span>
                                            <span>
                                                {project.completed_tasks}/{project.total_tasks} tasks
                                            </span>
                                        </div>
                                        {getStatusBadge(project.status)}
                                    </div>

                                    {/* Progress */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${project.status === 'completed' ? 'bg-green-500' :
                                                    project.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                                    }`}
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {project.progress}%
                                        </span>
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
