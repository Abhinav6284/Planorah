import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectService } from '../../api/projectService';
import { githubService } from '../../api/githubService';
import { portfolioService } from '../../api/portfolioService';

export default function ProjectManager() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showGitHubModal, setShowGitHubModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [message, setMessage] = useState(null);
    const [githubConnected, setGithubConnected] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tech_stack: [],
        source_type: 'manual',
        git_url: '',
        live_demo_url: '',
        visibility: 'public'
    });
    
    // GitHub publish state
    const [publishData, setPublishData] = useState({
        repo_name: '',
        is_private: false,
    });

    useEffect(() => {
        fetchProjects();
        checkGitHubStatus();
    }, []);

    const fetchProjects = async () => {
        try {
            const data = await projectService.list();
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkGitHubStatus = async () => {
        try {
            const status = await githubService.getStatus();
            setGithubConnected(status.connected);
        } catch (error) {
            console.error('Failed to check GitHub status:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedProject) {
                await projectService.update(selectedProject.id, formData);
                setMessage({ type: 'success', text: 'Project updated successfully!' });
            } else {
                await projectService.create(formData);
                setMessage({ type: 'success', text: 'Project created successfully!' });
            }
            fetchProjects();
            setShowModal(false);
            resetForm();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save project.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await projectService.delete(id);
            setMessage({ type: 'success', text: 'Project deleted successfully!' });
            fetchProjects();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete project.' });
        }
    };

    const handlePublishToGitHub = async () => {
        if (!selectedProject) return;
        try {
            await githubService.publish(
                selectedProject.id,
                'student',
                publishData.repo_name || null,
                publishData.is_private
            );
            setMessage({ type: 'success', text: 'Project published to GitHub!' });
            setShowGitHubModal(false);
            fetchProjects();
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Failed to publish to GitHub.' 
            });
        }
    };

    const handleAddToPortfolio = async (project) => {
        try {
            await portfolioService.addProject(project.id, 'student');
            setMessage({ type: 'success', text: 'Project added to portfolio!' });
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Failed to add to portfolio.' 
            });
        }
    };

    const openEditModal = (project) => {
        setSelectedProject(project);
        setFormData({
            title: project.title,
            description: project.description,
            tech_stack: project.tech_stack || [],
            source_type: project.source_type,
            git_url: project.git_url || '',
            live_demo_url: project.live_demo_url || '',
            visibility: project.visibility
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedProject(null);
        setFormData({
            title: '',
            description: '',
            tech_stack: [],
            source_type: 'manual',
            git_url: '',
            live_demo_url: '',
            visibility: 'public'
        });
    };

    const openGitHubModal = (project) => {
        setSelectedProject(project);
        setPublishData({
            repo_name: project.title.toLowerCase().replace(/\s+/g, '-'),
            is_private: false
        });
        setShowGitHubModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Loading projects...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 font-sans pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            My Projects
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage your projects and publish them to GitHub
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-all"
                    >
                        + New Project
                    </button>
                </motion.div>

                {/* Message */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}
                        >
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Projects Grid */}
                {projects.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No projects yet</p>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-all"
                        >
                            Create Your First Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {project.title}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${project.visibility === 'public' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {project.visibility}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                    {project.description}
                                </p>

                                {project.tech_stack && project.tech_stack.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tech_stack.slice(0, 3).map((tech, idx) => (
                                            <span key={idx} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg">
                                                {tech}
                                            </span>
                                        ))}
                                        {project.tech_stack.length > 3 && (
                                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg">
                                                +{project.tech_stack.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2 flex-wrap">
                                    {project.github_url ? (
                                        <a
                                            href={project.github_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-center"
                                        >
                                            View on GitHub →
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => openGitHubModal(project)}
                                            disabled={!githubConnected}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
                                        >
                                            Push to GitHub
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleAddToPortfolio(project)}
                                        className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        Add to Portfolio
                                    </button>
                                </div>

                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                                    <button
                                        onClick={() => openEditModal(project)}
                                        className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="flex-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Project Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {selectedProject ? 'Edit Project' : 'New Project'}
                                </h2>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Project Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                        placeholder="My Awesome Project"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white resize-none"
                                        placeholder="Describe your project..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Tech Stack (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tech_stack.join(', ')}
                                        onChange={(e) => setFormData({ 
                                            ...formData, 
                                            tech_stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                                        })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                        placeholder="React, Node.js, MongoDB"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Live Demo URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.live_demo_url}
                                        onChange={(e) => setFormData({ ...formData, live_demo_url: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                        placeholder="https://myproject.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Visibility
                                    </label>
                                    <select
                                        value={formData.visibility}
                                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold hover:opacity-90 transition-all"
                                    >
                                        {selectedProject ? 'Update' : 'Create'} Project
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* GitHub Publish Modal */}
            <AnimatePresence>
                {showGitHubModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowGitHubModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Publish to GitHub</h2>
                                <p className="text-sm text-gray-500 mt-1">Create a repository for {selectedProject?.title}</p>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Repository Name
                                    </label>
                                    <input
                                        type="text"
                                        value={publishData.repo_name}
                                        onChange={(e) => setPublishData({ ...publishData, repo_name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                        placeholder="my-project"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">Private Repository</h4>
                                        <p className="text-sm text-gray-500">Make repository private on GitHub</p>
                                    </div>
                                    <button
                                        onClick={() => setPublishData({ ...publishData, is_private: !publishData.is_private })}
                                        className={`w-12 h-6 rounded-full transition-colors ${publishData.is_private ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white dark:bg-gray-900 rounded-full transition-transform ${publishData.is_private ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowGitHubModal(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePublishToGitHub}
                                    className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold hover:opacity-90 transition-all"
                                >
                                    Publish to GitHub
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
