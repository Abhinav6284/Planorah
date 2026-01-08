import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { portfolioService } from '../../api/portfolioService';
import { useSubscription } from '../../context/SubscriptionContext';

export default function PortfolioEditor() {
    const { canAccess } = useSubscription();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const data = await portfolioService.getMyPortfolio();
            setPortfolio(data);
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
            setMessage({ type: 'success', text: 'Changes saved!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save changes.' });
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = () => {
        const url = portfolio?.custom_subdomain
            ? `https://${portfolio.custom_subdomain}.planorah.me`
            : `https://planorah.me/p/${portfolio?.slug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusInfo = () => {
        if (!portfolio) return { color: 'gray', label: 'Loading', icon: '○' };
        const statuses = {
            active: { color: 'emerald', label: 'Live', icon: '●' },
            grace: { color: 'yellow', label: 'Grace Period', icon: '●' },
            read_only: { color: 'gray', label: 'Read Only', icon: '○' },
            archived: { color: 'red', label: 'Archived', icon: '○' }
        };
        return statuses[portfolio.status] || statuses.archived;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading portfolio...</p>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo();
    const portfolioUrl = portfolio?.custom_subdomain
        ? `${portfolio.custom_subdomain}.planorah.me`
        : `planorah.me/p/${portfolio?.slug}`;

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'social', label: 'Social Links' },
        { id: 'projects', label: 'Projects' },
        { id: 'settings', label: 'Settings' }
    ];

    return (
        <div className="min-h-screen bg-black font-sans">
            {/* Top Header - Vercel Style */}
            <div className="border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {portfolio?.username?.charAt(0).toUpperCase() || 'P'}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-white font-semibold text-lg">
                                    {portfolio?.title || 'My Portfolio'}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className={`text-${statusInfo.color}-400 text-xs`}>
                                        {statusInfo.icon}
                                    </span>
                                    <span className="text-gray-500 text-sm">{statusInfo.label}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deployment Preview Banner - Vercel Style */}
            <div className="border-b border-gray-800 bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-gray-500 text-sm mb-2">Production Deployment</p>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                    </svg>
                                    <span className="text-white font-mono text-sm">{portfolioUrl}</span>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                    title="Copy URL"
                                >
                                    {copied ? (
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <a
                            href={`https://${portfolioUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        >
                            <span>Visit</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Message Toast */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50"
                    >
                        <div className={`px-4 py-3 rounded-lg shadow-lg ${message.type === 'success'
                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/20 border border-red-500/30 text-red-400'
                            }`}>
                            <div className="flex items-center gap-2">
                                {message.type === 'success' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                <span className="text-sm font-medium">{message.text}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-1 mb-8 border-b border-gray-800 -mx-6 px-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'general' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
                                    <h3 className="text-white font-semibold mb-4">Basic Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-2">Portfolio Title</label>
                                            <input
                                                name="title"
                                                value={portfolio?.title || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-gray-600 outline-none transition-colors"
                                                placeholder="My Developer Portfolio"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-2">Headline</label>
                                            <input
                                                name="headline"
                                                value={portfolio?.headline || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-gray-600 outline-none transition-colors"
                                                placeholder="Full-Stack Developer | Open Source Enthusiast"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-2">Bio</label>
                                            <textarea
                                                name="bio"
                                                value={portfolio?.bio || ''}
                                                onChange={handleChange}
                                                rows={5}
                                                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-gray-600 outline-none transition-colors resize-none"
                                                placeholder="Tell visitors about yourself, your experience, and what you're passionate about..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'social' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
                                    <h3 className="text-white font-semibold mb-4">Social Links</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-2">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                    </svg>
                                                    GitHub
                                                </span>
                                            </label>
                                            <input
                                                name="github_url"
                                                value={portfolio?.github_url || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-gray-600 outline-none transition-colors"
                                                placeholder="https://github.com/username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-2">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                    </svg>
                                                    LinkedIn
                                                </span>
                                            </label>
                                            <input
                                                name="linkedin_url"
                                                value={portfolio?.linkedin_url || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-gray-600 outline-none transition-colors"
                                                placeholder="https://linkedin.com/in/username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-2">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                    Twitter / X
                                                </span>
                                            </label>
                                            <input
                                                name="twitter_url"
                                                value={portfolio?.twitter_url || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-gray-600 outline-none transition-colors"
                                                placeholder="https://twitter.com/username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-2">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                                    </svg>
                                                    Website
                                                </span>
                                            </label>
                                            <input
                                                name="website_url"
                                                value={portfolio?.website_url || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-gray-600 outline-none transition-colors"
                                                placeholder="https://yourwebsite.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'projects' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-white font-semibold">Portfolio Projects</h3>
                                            <p className="text-gray-500 text-sm mt-1">
                                                {portfolio?.portfolio_projects?.length || 0} projects added
                                            </p>
                                        </div>
                                        <Link
                                            to="/projects"
                                            className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                        >
                                            Manage Projects
                                        </Link>
                                    </div>

                                    {portfolio?.portfolio_projects && portfolio.portfolio_projects.length > 0 ? (
                                        <div className="space-y-3">
                                            {portfolio.portfolio_projects.map((project, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-4 bg-black border border-gray-800 rounded-lg flex items-center justify-between"
                                                >
                                                    <div className="flex-1">
                                                        <h4 className="text-white font-medium">
                                                            {project.display_title || project.project_title}
                                                        </h4>
                                                        {project.tech_stack && project.tech_stack.length > 0 && (
                                                            <div className="flex gap-2 mt-2">
                                                                {project.tech_stack.slice(0, 3).map((tech, i) => (
                                                                    <span key={i} className="px-2 py-0.5 text-xs bg-gray-800 text-gray-400 rounded">
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {project.is_featured && (
                                                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
                                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-900 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 mb-4">No projects added yet</p>
                                            <Link
                                                to="/projects"
                                                className="inline-block px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                            >
                                                Add Your First Project
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
                                    <h3 className="text-white font-semibold mb-4">Display Settings</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-lg">
                                            <div>
                                                <h4 className="text-white font-medium">Show Email</h4>
                                                <p className="text-gray-500 text-sm">Display your email on portfolio</p>
                                            </div>
                                            <button
                                                onClick={() => handleToggle('show_email')}
                                                className={`w-12 h-6 rounded-full transition-colors ${portfolio?.show_email ? 'bg-emerald-500' : 'bg-gray-700'}`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${portfolio?.show_email ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 text-sm mb-2">Theme</label>
                                            <select
                                                name="theme"
                                                value={portfolio?.theme || 'default'}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-gray-600 outline-none transition-colors"
                                            >
                                                <option value="default">Dark (Default)</option>
                                                <option value="minimal">Light / Minimal</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {canAccess('custom_subdomain') && (
                                    <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
                                        <h3 className="text-white font-semibold mb-4">Custom Domain</h3>
                                        <p className="text-gray-500 text-sm mb-4">
                                            Your portfolio is available at a custom subdomain
                                        </p>
                                        <div className="p-4 bg-black border border-gray-800 rounded-lg">
                                            <p className="text-white font-mono">
                                                {portfolio?.custom_subdomain
                                                    ? `${portfolio.custom_subdomain}.planorah.me`
                                                    : 'Not configured'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="ml-2 text-gray-500 text-xs font-mono truncate flex-1">
                                        {portfolioUrl}
                                    </span>
                                </div>
                                <div className="p-6 min-h-[400px] bg-black">
                                    {/* Mini Preview */}
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <span className="text-white font-bold text-xl">
                                                {portfolio?.username?.charAt(0).toUpperCase() || '?'}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-semibold mb-1">
                                            {portfolio?.title || 'Your Name'}
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-4">
                                            {portfolio?.headline || 'Your headline here'}
                                        </p>

                                        {/* Social Icons Preview */}
                                        <div className="flex justify-center gap-2 mb-6">
                                            {portfolio?.github_url && (
                                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                    </svg>
                                                </div>
                                            )}
                                            {portfolio?.linkedin_url && (
                                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                    </svg>
                                                </div>
                                            )}
                                            {portfolio?.twitter_url && (
                                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {portfolio?.bio && (
                                            <div className="text-left p-3 bg-gray-900/50 rounded-lg">
                                                <p className="text-gray-400 text-xs line-clamp-3">
                                                    {portfolio.bio}
                                                </p>
                                            </div>
                                        )}

                                        {portfolio?.portfolio_projects?.length > 0 && (
                                            <div className="mt-4 text-left">
                                                <p className="text-gray-500 text-xs mb-2">Projects</p>
                                                <div className="space-y-2">
                                                    {portfolio.portfolio_projects.slice(0, 2).map((p, i) => (
                                                        <div key={i} className="p-2 bg-gray-900/50 rounded-lg">
                                                            <p className="text-white text-xs font-medium truncate">
                                                                {p.display_title || p.project_title}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-center text-gray-600 text-xs mt-4">
                                Live preview of your portfolio
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
