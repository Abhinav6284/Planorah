import React, { useState, useEffect } from 'react';
import { githubService } from '../../../api/githubService';

const CodeSpaceWidget = () => {
    const [status, setStatus] = useState({ connected: false, loading: true });

    useEffect(() => {
        fetchGitHubStatus();
    }, []);

    const fetchGitHubStatus = async () => {
        try {
            const statusData = await githubService.getStatus();
            setStatus({ ...statusData, loading: false });
        } catch (error) {
            console.error('Failed to fetch GitHub status:', error);
            setStatus({ connected: false, loading: false });
        }
    };

    const handleConnect = () => {
        const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
        const redirectUri = `${window.location.origin}/auth/github/callback`;
        const scope = 'repo user';
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=connect`;
    };

    if (status.loading) {
        return (
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 h-full flex items-center justify-center min-h-[280px]">
                <div className="text-gray-400 dark:text-gray-500 animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 h-full flex flex-col justify-between relative overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow min-h-[280px]">
            {/* Header */}
            <div className="flex justify-between items-start z-10">
                <div className="w-12 h-12 bg-[#007ACC]/10 rounded-xl flex items-center justify-center text-[#007ACC]">
                    {/* VS Code Icon (simplified) */}
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.15 2.587l-9.8 8.033 9.8 8.033c.594.49 1.458.113 1.458-.636V3.223c0-.75-.864-1.127-1.458-.636zM11.9 4.39L2.3 8.35c-.8.33-1.3.9-1.3 1.65v4c0 .75.5 1.32 1.3 1.65l9.6 3.96c.6.25 1.1-.15 1.1-.8V5.19c0-.65-.5-1.05-1.1-.8z" />
                    </svg>
                </div>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full">
                    VS Code
                </span>
            </div>

            {/* Content */}
            <div className="z-10 mt-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    CodeSpace IDE
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                    A full VS Code-like IDE experience with file explorer, terminal, and multi-language code execution.
                </p>
            </div>

            {/* Bottom Section */}
            <div className="z-10 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    {status.connected ? (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                @{status.github_username}
                            </span>
                        </div>
                    ) : (
                        <button
                            onClick={handleConnect}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
                        >
                            Connect GitHub
                        </button>
                    )}

                    <span className="text-xs font-medium text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">
                        Coming Soon
                    </span>
                </div>
            </div>

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#007ACC]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>
        </div>
    );
};

export default CodeSpaceWidget;
