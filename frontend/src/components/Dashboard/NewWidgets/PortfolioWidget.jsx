import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { portfolioService } from '../../../api/portfolioService';

const PortfolioWidget = () => {
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const data = await portfolioService.getMyPortfolio();
            setPortfolio(data);
        } catch (error) {
            console.error('Failed to fetch portfolio:', error);
            setPortfolio(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = () => {
        if (!portfolio) return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', label: 'Not Set' };
        const statuses = {
            active: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Live' },
            grace: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', label: 'Grace Period' },
            read_only: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', label: 'Read Only' },
            archived: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Archived' }
        };
        return statuses[portfolio.status] || statuses.archived;
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 h-full flex items-center justify-center border border-gray-100 dark:border-gray-800">
                <div className="text-gray-400 dark:text-gray-500 animate-pulse">Loading...</div>
            </div>
        );
    }

    const statusBadge = getStatusBadge();

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 h-full flex flex-col relative overflow-hidden border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Portfolio</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {portfolio?.title || 'Your public profile'}
                        </p>
                    </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                    {statusBadge.label}
                </span>
            </div>

            {/* Portfolio Preview */}
            {portfolio ? (
                <div className="flex-1 flex flex-col">
                    {/* Info Card */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4 flex-1">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden flex-shrink-0">
                                {portfolio.avatar_url ? (
                                    <img src={portfolio.avatar_url} alt="Portfolio" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                                        👤
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {portfolio.title || 'My Portfolio'}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {portfolio.headline || portfolio.bio || 'Add a headline to your portfolio'}
                                </p>
                            </div>
                        </div>

                        {/* URL */}
                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-lg">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1 font-mono">
                                {portfolio.custom_subdomain 
                                    ? `${portfolio.custom_subdomain}.planorah.me`
                                    : `planorah.me/p/${portfolio.slug}`
                                }
                            </span>
                            <a
                                href={portfolio.public_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Link
                            to="/portfolio/edit"
                            className="flex-1 text-center py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Edit Portfolio
                        </Link>
                        <a
                            href={portfolio.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            View →
                        </a>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Create your public portfolio
                    </p>
                    <Link
                        to="/portfolio/edit"
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Get Started
                    </Link>
                </div>
            )}

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        </div>
    );
};

export default PortfolioWidget;
