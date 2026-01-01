import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AIHelpWidget = () => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
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
            className="bg-transparent h-full flex items-center justify-between gap-4 cursor-text"
            onClick={() => inputRef.current?.focus()}
        >
            {/* Left: Text & Input */}
            <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        Hey, Need help?
                    </h3>
                    <span className="text-xl">👋</span>
                </div>

                {/* Input with blinking cursor */}
                <div className="relative mt-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Just ask me anything!"
                        className="w-full bg-transparent text-gray-500 dark:text-gray-400 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none caret-indigo-500"
                        style={{ caretColor: '#6366f1' }}
                    />
                    {/* Blinking cursor indicator when empty and not focused */}
                    {!inputValue && !isFocused && (
                        <span className="absolute left-[140px] top-0 text-gray-400 animate-pulse">|</span>
                    )}
                </div>
            </div>

            {/* Right: Chat Button */}
            <button
                onClick={handleSubmit}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-110 group flex-shrink-0"
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
    );
};

export default AIHelpWidget;
