import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioService } from '../../api/portfolioService';
import { useSubscription } from '../../context/SubscriptionContext';

export default function PortfolioEditor() {
    const { canAccess } = useSubscription();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [showSubdomainModal, setShowSubdomainModal] = useState(false);
    const [subdomain, setSubdomain] = useState('');

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const data = await portfolioService.getMyPortfolio();
            setPortfolio(data);
            setSubdomain(data.custom_subdomain || '');
        } catch (error) {
            console.error('Failed to fetch portfolio:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setPortfolio({ ...portfolio, [e.target.name]: e.target.value });
    };

    const handleToggle = (field) => {
        setPortfolio({ ...portfolio, [field]: !portfolio[field] });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await portfolioService.updateSettings({
                title: portfolio.title,
                bio: portfolio.bio,
                headline: portfolio.headline,
                github_url: portfolio.github_url,
                linkedin_url: portfolio.linkedin_url,
                twitter_url: portfolio.twitter_url,
                website_url: portfolio.website_url,
                show_email: portfolio.show_email,
                theme: portfolio.theme
            });
            setMessage({ type: 'success', text: 'Portfolio updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update portfolio.' });
        } finally {
            setSaving(false);
        }
    };

    const handleSetSubdomain = async () => {
        if (!subdomain.trim()) return;
        try {
            await portfolioService.setSubdomain(subdomain);
            setPortfolio({ ...portfolio, custom_subdomain: subdomain });
            setShowSubdomainModal(false);
            setMessage({ type: 'success', text: 'Subdomain set successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to set subdomain.' });
        }
    };

    const getStatusBadge = () => {
        if (!portfolio) return null;
        const colors = {
            active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            grace: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            read_only: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
            archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[portfolio.status] || colors.archived;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Loading portfolio...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 font-sans pb-20">
            {/* Subdomain Modal */}
            <AnimatePresence>
                {showSubdomainModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowSubdomainModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Set Custom Subdomain</h2>
                                <p className="text-sm text-gray-500 mt-1">Your portfolio will be available at <span className="font-mono text-gray-700 dark:text-gray-300">[subdomain].planorah.me</span></p>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={subdomain}
                                        onChange={(e) => {
                                            // Sanitize: lowercase, alphanumeric and hyphens only
                                            // Prevent leading/trailing hyphens and consecutive hyphens
                                            let value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                            value = value.replace(/^-+/, '').replace(/-+$/, '').replace(/--+/g, '-');
                                            setSubdomain(value);
                                        }}
                                        placeholder="your-name"
                                        className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white font-mono"
                                    />
                                    <span className="text-gray-500">.planorah.me</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-4">Only lowercase letters, numbers, and hyphens allowed (no leading/trailing hyphens).</p>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSubdomainModal(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSetSubdomain}
                                    className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold hover:opacity-90 transition-all"
                                >
                                    Set Subdomain
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Portfolio
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Customize your public portfolio page
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge()}`}>
                            {portfolio?.status?.replace('_', ' ')}
                        </span>
                        <a
                            href={portfolio?.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                            View Live →
                        </a>
                    </div>
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

                {/* Portfolio URL */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Portfolio URL</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-500 mb-2">Default URL</label>
                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 font-mono text-sm break-all">
                                planorah.me/p/{portfolio?.slug}
                            </div>
                        </div>
                        {canAccess('custom_subdomain') && (
                            <div className="flex-1">
                                <label className="block text-sm text-gray-500 mb-2">Custom Subdomain</label>
                                {portfolio?.custom_subdomain ? (
                                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 font-mono text-sm">
                                        {portfolio.custom_subdomain}.planorah.me
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowSubdomainModal(true)}
                                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm"
                                    >
                                        + Set Custom Subdomain
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Basic Info */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Portfolio Title</label>
                            <input
                                name="title"
                                value={portfolio?.title || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="My Developer Portfolio"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Headline</label>
                            <input
                                name="headline"
                                value={portfolio?.headline || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="Full-Stack Developer | Open Source Enthusiast"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Bio</label>
                            <textarea
                                name="bio"
                                value={portfolio?.bio || ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white resize-none"
                                placeholder="Tell visitors about yourself..."
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Social Links */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Social Links</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">GitHub</label>
                            <input
                                name="github_url"
                                value={portfolio?.github_url || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="https://github.com/username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">LinkedIn</label>
                            <input
                                name="linkedin_url"
                                value={portfolio?.linkedin_url || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Twitter</label>
                            <input
                                name="twitter_url"
                                value={portfolio?.twitter_url || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="https://twitter.com/username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Website</label>
                            <input
                                name="website_url"
                                value={portfolio?.website_url || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Settings */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Show Email</h4>
                                <p className="text-sm text-gray-500">Display your email on the portfolio</p>
                            </div>
                            <button
                                onClick={() => handleToggle('show_email')}
                                className={`w-12 h-6 rounded-full transition-colors ${portfolio?.show_email ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                            >
                                <div className={`w-5 h-5 bg-white dark:bg-gray-900 rounded-full transition-transform ${portfolio?.show_email ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Theme</label>
                            <select
                                name="theme"
                                value={portfolio?.theme || 'default'}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 outline-none transition-all text-gray-900 dark:text-white"
                            >
                                <option value="default">Default</option>
                                <option value="minimal">Minimal</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Projects Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6"
                >
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Projects</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage projects displayed on your portfolio</p>
                        </div>
                        <a
                            href="/projects"
                            className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                            Manage Projects →
                        </a>
                    </div>

                    {portfolio?.portfolio_projects && portfolio.portfolio_projects.length > 0 ? (
                        <div className="space-y-3">
                            {portfolio.portfolio_projects.map((portfolioProject, idx) => (
                                <div 
                                    key={idx}
                                    className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                                {portfolioProject.display_title || portfolioProject.project_title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                                {portfolioProject.display_description || portfolioProject.project_description}
                                            </p>
                                            {portfolioProject.tech_stack && portfolioProject.tech_stack.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {portfolioProject.tech_stack.slice(0, 3).map((tech, techIdx) => (
                                                        <span 
                                                            key={techIdx}
                                                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {portfolioProject.tech_stack.length > 3 && (
                                                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg">
                                                            +{portfolioProject.tech_stack.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            {portfolioProject.github_url && (
                                                <a
                                                    href={portfolioProject.github_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                >
                                                    GitHub →
                                                </a>
                                            )}
                                            {portfolioProject.is_featured && (
                                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                            <p className="text-gray-500 dark:text-gray-400 mb-3">No projects added to portfolio yet</p>
                            <a
                                href="/projects"
                                className="inline-block px-4 py-2 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-all"
                            >
                                Add Your First Project
                            </a>
                        </div>
                    )}
                </motion.div>

                {/* Save Button */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
