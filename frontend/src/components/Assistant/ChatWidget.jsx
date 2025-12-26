import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { assistantService } from '../../api/assistantService';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: "Hi! 👋 I'm your **Planorah Assistant**. Ask me about your roadmaps, tasks, or anything related to your learning journey!"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: input.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await assistantService.sendMessage(userMessage.content);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.message || "I'm not sure how to help with that. Try asking about your tasks or roadmaps!"
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: "Sorry, I encountered an error. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const quickQuestions = [
        "What should I study today?",
        "How am I progressing?",
        "What's my next task?"
    ];

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center z-50 hover:scale-110 transition-transform"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-indigo-500/10 border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Planorah Assistant</h3>
                                        <p className="text-xs text-white/80">Ask about your learning journey</p>
                                    </div>
                                </div>
                                <Link
                                    to="/assistant"
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    title="Open full chat"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-indigo-500 text-white rounded-br-md'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-md'
                                        }`}>
                                        {msg.role === 'assistant' ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        {messages.length <= 2 && (
                            <div className="px-4 pb-2">
                                <div className="flex gap-2 flex-wrap">
                                    {quickQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setInput(q);
                                                setTimeout(() => handleSend(), 100);
                                            }}
                                            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about your tasks..."
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

