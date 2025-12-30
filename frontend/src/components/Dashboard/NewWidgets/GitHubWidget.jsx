import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { githubService } from '../../../api/githubService';

const GitHubWidget = () => {
    const [status, setStatus] = useState({ connected: false, loading: true });
    const [repos, setRepos] = useState([]);

    useEffect(() => {
        fetchGitHubStatus();
    }, []);

    const fetchGitHubStatus = async () => {
        try {
            const statusData = await githubService.getStatus();
            setStatus({ ...statusData, loading: false });
            
            if (statusData.connected) {
                const reposData = await githubService.getRepositories();
                setRepos(reposData.slice(0, 3)); // Show only latest 3
            }
        } catch (error) {
            console.error('Failed to fetch GitHub status:', error);
            setStatus({ connected: false, loading: false });
        }
    };

    const handleConnect = () => {
        // Redirect to GitHub OAuth
        const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
        const redirectUri = `${window.location.origin}/auth/github/callback`;
        const scope = 'repo user';
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=connect`;
    };

    if (status.loading) {
        return (
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 h-full flex items-center justify-center">
                <div className="text-gray-400 dark:text-gray-500 animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 h-full flex flex-col relative overflow-hidden border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">GitHub</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {status.connected ? `@${status.github_username}` : 'Not connected'}
                        </p>
                    </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${status.connected ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    {status.connected ? 'Connected' : 'Disconnected'}
                </span>
            </div>

            {/* Content */}
            {status.connected ? (
                <div className="flex-1 flex flex-col">
                    {/* Recent Repos */}
                    <div className="flex-1 space-y-2 mb-4">
                        {repos.length > 0 ? (
                            repos.map((repo, index) => (
                                <a
                                    key={index}
                                    href={repo.repo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                >
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {repo.repo_name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {repo.is_private ? '🔒 Private' : '🌐 Public'}
                                        </p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            ))
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center p-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No repositories published yet</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Complete a project to publish it</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Link */}
                    <Link
                        to="/roadmap/list"
                        className="text-center py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                    >
                        View All Projects →
                    </Link>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Connect GitHub to publish your projects
                    </p>
                    <button
                        onClick={handleConnect}
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Connect GitHub
                    </button>
                </div>
            )}

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        </div>
    );
};

export default GitHubWidget;
