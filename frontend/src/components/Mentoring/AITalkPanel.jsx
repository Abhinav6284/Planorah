import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mentoringService } from "../../api/mentoringService";
import {
    FaTimes,
    FaPaperPlane,
    FaBrain,
    FaCheckCircle,
    FaSmile,
    FaMicrophone,
} from "react-icons/fa";

// Tone badge colour mapping
const toneBadgeStyles = {
    encouraging: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    empathetic: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    motivating: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    neutral: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    supportive: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    challenging: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    celebratory: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
};

/**
 * Reusable AI Mentoring Talk Panel.
 *
 * Props:
 *  - contextSource  (string, required) e.g. "roadmap", "dashboard"
 *  - studentGoal    (string, optional)
 *  - currentProgress(string, optional)
 *  - isOpen         (bool) controlled open state
 *  - onClose        (fn)   close handler
 *  - mode           ("panel" | "modal")  default "panel"
 */
export default function AITalkPanel({
    contextSource = "general",
    studentGoal = "",
    currentProgress = "",
    isOpen = false,
    onClose,
    mode = "panel",
}) {
    const [transcript, setTranscript] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!transcript.trim()) return;
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await mentoringService.createSession({
                context_source: contextSource,
                student_goal: studentGoal,
                current_progress: currentProgress,
                transcript: transcript.trim(),
            });
            setResult(data);
            setTranscript("");
        } catch (err) {
            console.error("Mentoring session error:", err);
            setError(
                err.response?.data?.error ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    // ── Wrapper animation variants ──
    const panelVariants = {
        hidden: { x: "100%", opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 200 } },
        exit: { x: "100%", opacity: 0, transition: { duration: 0.2 } },
    };

    const modalVariants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { type: "spring", damping: 20, stiffness: 250 } },
        exit: { scale: 0.9, opacity: 0, transition: { duration: 0.15 } },
    };

    const variants = mode === "modal" ? modalVariants : panelVariants;

    // ── Content ──
    const content = (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={
                mode === "modal"
                    ? "relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden"
                    : "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
            }
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <FaBrain className="text-indigo-600 dark:text-indigo-400 text-sm" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            AI Mentor
                        </h3>
                        <p className="text-[11px] text-gray-400 capitalize">
                            {contextSource} session
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <FaTimes />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Input Area */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                        What's on your mind?
                    </label>
                    <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={4}
                        placeholder="Share what you're working on, any challenges, or questions..."
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-gray-400"
                        disabled={loading}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <button
                            disabled
                            title="Voice input coming soon"
                            className="flex items-center gap-1.5 text-xs text-gray-400 cursor-not-allowed"
                        >
                            <FaMicrophone className="text-[10px]" />
                            Voice (soon)
                        </button>
                        <span className="text-[11px] text-gray-400">
                            Ctrl+Enter to send
                        </span>
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !transcript.trim()}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all
                        ${loading || !transcript.trim()
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                        }`}
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Thinking...
                        </>
                    ) : (
                        <>
                            <FaPaperPlane className="text-xs" />
                            Talk to Mentor
                        </>
                    )}
                </button>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                {/* AI Response */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-4"
                        >
                            {/* Emotional Tone Badge */}
                            <div className="flex items-center gap-2">
                                <FaSmile className="text-gray-400 text-xs" />
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${toneBadgeStyles[result.emotional_tone] || toneBadgeStyles.neutral
                                        }`}
                                >
                                    {result.emotional_tone}
                                </span>
                            </div>

                            {/* Mentor Message */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                                    {result.mentor_message}
                                </p>
                            </div>

                            {/* Confidence Progress Bar */}
                            <div>
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                    <span>Confidence Level</span>
                                    <span>{Math.round((result.confidence_level || 0) * 100)}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(result.confidence_level || 0) * 100}%`,
                                        }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Clarity Progress Bar */}
                            <div>
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                    <span>Clarity Level</span>
                                    <span>{Math.round((result.clarity_level || 0) * 100)}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(result.clarity_level || 0) * 100}%`,
                                        }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Action Items */}
                            {result.action_items?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Action Items
                                    </h4>
                                    <ul className="space-y-2">
                                        {result.action_items.map((item, i) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + i * 0.1 }}
                                                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                <FaCheckCircle className="text-indigo-500 mt-0.5 flex-shrink-0 text-xs" />
                                                <span>{item}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );

    // ── Render wrapper ──
    if (!isOpen) return null;

    if (mode === "modal") {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && onClose?.()}
                >
                    {content}
                </motion.div>
            </AnimatePresence>
        );
    }

    // Slide-in panel (default)
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    onClick={onClose}
                />
                {content}
            </div>
        </AnimatePresence>
    );
}
