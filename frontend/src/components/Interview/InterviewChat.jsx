import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function InterviewChat() {
    const { sessionId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const res = await axios.get(`/interview/${sessionId}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSessionData(res.data);
                setMessages(res.data.messages || []);
            } catch (error) {
                console.error("Failed to load session", error);
            }
        };
        fetchSession();
    }, [sessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Optimistic update
        const newMsg = { id: Date.now(), sender: 'user', content: input };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        setLoading(true);
        setFeedback(null);

        try {
            const token = localStorage.getItem("access_token");
            const res = await axios.post(`/interview/${sessionId}/message/`, {
                content: newMsg.content
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update with full data from server (includes AI response and potentially feedback on user msg)
            setSessionData(res.data);
            setMessages(res.data.messages);

            // Find if there is feedback on the message we just sent (which is now in the list)
            // The logic in backend updates the user message with feedback.
            // We can show it in a toast or separate panel.
            const lastUserMsg = res.data.messages.filter(m => m.sender === 'user').pop();
            if (lastUserMsg && lastUserMsg.feedback) {
                setFeedback(lastUserMsg.feedback);
            }

        } catch (error) {
            console.error("Error sending message", error);
            setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900 font-sans relative overflow-hidden">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {sessionData ? sessionData.job_role : "Interview"}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {sessionData?.topic} • 🤖 AI Interviewer
                    </p>
                </div>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 px-4 py-2 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 ml-4 max-w-md truncate"
                        title={feedback}
                    >
                        💡 Feedback available on your last answer
                    </motion.div>
                )}
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {messages.map((msg, index) => (
                    <motion.div
                        key={msg.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] md:max-w-[70%] space-y-2`}>
                            <div className={`p-5 rounded-2xl shadow-sm leading-relaxed ${msg.sender === 'user'
                                ? 'bg-black dark:bg-white text-white dark:text-black rounded-tr-none'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>

                            {msg.sender === 'user' && msg.feedback && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800"
                                >
                                    <strong>💡 Feedback:</strong> {msg.feedback}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 flex gap-2">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full px-6 py-4 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white pr-16"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-2 bottom-2 bg-black dark:bg-white text-white dark:text-black rounded-full px-6 font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
