import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AIHelpWidget = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            // Navigate to AI assistant with the question
            navigate('/ai-assistant', { state: { initialMessage: inputValue } });
        } else {
            navigate('/ai-assistant');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
    };

    return (
        <div
            className="relative h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Widget - Transparent Background */}
            <div
                className="bg-transparent rounded-[24px] px-4 sm:px-5 py-4 h-full flex items-center justify-between cursor-pointer transition-all duration-300"
                onClick={() => !isHovered && navigate('/ai-assistant')}
            >
                {/* Left: Text */}
                <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        Hey, Need help?<span className="ml-2">👋</span>
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
                        Just ask me anything!
                    </p>
                </div>

                {/* Right: Chat Button */}
                <button
                    onClick={() => navigate('/ai-assistant')}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-110 group"
                >
                    <svg
                        className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-500 transition-colors"
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
                </button>
            </div>

            {/* Hover Popup - Chat Input */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-full left-0 right-0 mt-2 z-50"
                    >
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-xl">
                            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask me anything..."
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-11 h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </form>

                            {/* Quick suggestions */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {['Help me learn', 'Study tips', 'Task help'].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => {
                                            setInputValue(suggestion);
                                            navigate('/ai-assistant', { state: { initialMessage: suggestion } });
                                        }}
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIHelpWidget;
