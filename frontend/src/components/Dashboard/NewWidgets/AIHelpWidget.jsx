import React from 'react';
import { Link } from 'react-router-dom';

const AIHelpWidget = () => {
    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 h-full flex items-center justify-between border border-gray-100 dark:border-gray-800 shadow-sm">
            {/* Left: Text */}
            <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    Hey, Need help?<span className="ml-2">👋</span>
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Just ask me anything!
                </p>
            </div>

            {/* Right: Mic Button */}
            <Link
                to="/ai-assistant"
                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors group"
            >
                <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-orange-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            </Link>
        </div>
    );
};

export default AIHelpWidget;
