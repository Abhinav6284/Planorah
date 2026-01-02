import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AIHelpWidget = () => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e?.preventDefault();
        // Navigate to AI assistant with the question
        navigate('/assistant', { state: { initialMessage: inputValue } });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div
            className="bg-transparent px-2 py-3 h-full flex items-center justify-between gap-4 cursor-text"
            onClick={() => inputRef.current?.focus()}
        >
            {/* Left: Text & Input */}
            <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        Hey, Need help?
                    </h3>
                    <span className="text-2xl">👋</span>
                </div>

                {/* Input with blinking cursor */}
                <div className="relative mt-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Just type here..."
                        className="w-full bg-transparent text-gray-600 dark:text-gray-300 text-base sm:text-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none caret-indigo-500"
                        style={{ caretColor: '#6366f1' }}
                    />
                </div>
            </div>

            {/* Right: Chat Button */}
            <button
                onClick={handleSubmit}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 flex items-center justify-center transition-all hover:scale-110 group flex-shrink-0 border border-gray-200 dark:border-gray-700"
            >
                <svg
                    className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            </button>
        </div>
    );
};

export default AIHelpWidget;
