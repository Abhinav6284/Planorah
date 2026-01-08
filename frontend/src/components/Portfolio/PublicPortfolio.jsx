import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { portfolioService } from '../../api/portfolioService';

export default function PublicPortfolio() {
    const { slug } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPortfolio();
    }, [slug]);

    const fetchPortfolio = async () => {
        try {
            const data = await portfolioService.getPublicBySlug(slug);
            setPortfolio(data);
        } catch (err) {
            console.error('Failed to fetch portfolio:', err);
            setError('Portfolio not found');
        } finally {
            setLoading(false);
        }
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

    if (error || !portfolio) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-900 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Portfolio Not Found</h1>
                    <p className="text-gray-500">This portfolio doesn't exist or has been archived.</p>
                </div>
            </div>
        );
    }

    const getThemeClasses = () => {
        switch (portfolio.theme) {
            case 'minimal':
                return {
                    bg: 'bg-white',
                    text: 'text-gray-900',
                    secondary: 'text-gray-600',
                    card: 'bg-gray-50 border-gray-200',
                    accent: 'from-gray-900 to-gray-700'
                };
            case 'dark':
            default:
                return {
                    bg: 'bg-black',
                    text: 'text-white',
                    secondary: 'text-gray-400',
                    card: 'bg-[#0a0a0a] border-gray-800',
                    accent: 'from-blue-500 to-purple-600'
                };
        }
    };

    const theme = getThemeClasses();

    return (
        <div className={`min-h-screen ${theme.bg} font-sans`}>
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative overflow-hidden"
            >
                {/* Gradient Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br ${theme.accent} rounded-full blur-3xl opacity-20`} />
                    <div className={`absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br ${theme.accent} rounded-full blur-3xl opacity-10`} />
                </div>

                <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center"
                    >
                        {/* Avatar */}
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ring-4 ring-gray-800">
                            <span className="text-3xl font-bold text-white">
                                {portfolio.username?.charAt(0).toUpperCase() || '?'}
                            </span>
                        </div>

                        {/* Name & Title */}
                        <h1 className={`text-4xl md:text-5xl font-bold ${theme.text} mb-4`}>
                            {portfolio.title || portfolio.username}
                        </h1>

                        {portfolio.headline && (
                            <p className={`text-xl ${theme.secondary} mb-6 max-w-2xl mx-auto`}>
                                {portfolio.headline}
                            </p>
                        )}

                        {/* Social Links */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            {portfolio.github_url && (
                                <a
                                    href={portfolio.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800 border border-gray-800 transition-all hover:scale-105"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                            )}
                            {portfolio.linkedin_url && (
                                <a
                                    href={portfolio.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800 border border-gray-800 transition-all hover:scale-105"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            )}
                            {portfolio.twitter_url && (
                                <a
                                    href={portfolio.twitter_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800 border border-gray-800 transition-all hover:scale-105"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                            )}
                            {portfolio.website_url && (
                                <a
                                    href={portfolio.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800 border border-gray-800 transition-all hover:scale-105"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </a>
                            )}
                            {portfolio.email && (
                                <a
                                    href={`mailto:${portfolio.email}`}
                                    className="p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800 border border-gray-800 transition-all hover:scale-105"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Bio Section */}
            {portfolio.bio && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-4xl mx-auto px-6 pb-16"
                >
                    <div className={`${theme.card} border rounded-2xl p-8`}>
                        <h2 className={`text-lg font-semibold ${theme.text} mb-4`}>About</h2>
                        <p className={`${theme.secondary} leading-relaxed whitespace-pre-wrap`}>
                            {portfolio.bio}
                        </p>
                    </div>
                </motion.section>
            )}

            {/* Projects Section */}
            {portfolio.projects && portfolio.projects.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-4xl mx-auto px-6 pb-20"
                >
                    <h2 className={`text-2xl font-bold ${theme.text} mb-8`}>Projects</h2>

                    <div className="grid gap-6">
                        {portfolio.projects.map((project, index) => (
                            <motion.div
                                key={project.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className={`${theme.card} border rounded-2xl p-6 hover:border-gray-700 transition-all group`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className={`text-xl font-semibold ${theme.text}`}>
                                                {project.display_title || project.project_title || project.title}
                                            </h3>
                                            {project.is_featured && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                                                    Featured
                                                </span>
                                            )}
                                        </div>

                                        <p className={`${theme.secondary} mb-4 line-clamp-3`}>
                                            {project.display_description || project.project_description || project.description}
                                        </p>

                                        {/* Tech Stack */}
                                        {project.tech_stack && project.tech_stack.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {project.tech_stack.map((tech, techIdx) => (
                                                    <span
                                                        key={techIdx}
                                                        className="px-3 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-full"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Links */}
                                    <div className="flex gap-3">
                                        {project.github_url && (
                                            <a
                                                href={project.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                </svg>
                                                Code
                                            </a>
                                        )}
                                        {project.demo_url && (
                                            <a
                                                href={project.demo_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 text-sm font-medium text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Demo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="text-sm text-gray-500">
                        Built with{' '}
                        <a
                            href="https://planorah.me"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Planorah
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
