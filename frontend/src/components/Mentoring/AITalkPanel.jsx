import React, { useState, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { mentoringService } from "../../api/mentoringService";
import {
    FaTimes,
    FaPaperPlane,
    FaCheckCircle,
    FaSmile,
} from "react-icons/fa";

// Tone badge colour mapping
const toneBadgeStyles = {
    encouraging: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    empathetic: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    motivating: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    neutral: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    supportive: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
    challenging: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
    celebratory: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
};

/**
 * AITalkPanel — Immersive full-screen text mentor experience.
 * Shares the same glassmorphic / ambient-gradient aesthetic as AIVoicePanel,
 * so switching between the two feels like two faces of the same surface.
 *
 * Props:
 *  - contextSource   (string, required)
 *  - studentGoal     (string, optional)
 *  - currentProgress (string, optional)
 *  - isOpen          (bool)
 *  - onClose         (fn)
 *  - onSwitchToVoice (fn)  called when user taps the Voice pill
 *  - mode            ("panel" | "modal") kept for back-compat
 */
export default function AITalkPanel({
    contextSource = "general",
    studentGoal = "",
    currentProgress = "",
    isOpen = false,
    onClose,
    onSwitchToVoice,
    mode = "panel",
}) {
    const [transcript, setTranscript] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [switchingToVoice, setSwitchingToVoice] = useState(false);

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
            setError(err.response?.data?.error || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
    };

    const handleClose = useCallback(() => {
        setResult(null);
        setTranscript("");
        onClose?.();
    }, [onClose]);

    const handleSwitchToVoice = useCallback(() => {
        setSwitchingToVoice(true);
        setTimeout(() => {
            setResult(null);
            setTranscript("");
            setSwitchingToVoice(false);
            onSwitchToVoice?.();
        }, 320);
    }, [onSwitchToVoice]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="text-fullscreen"
                initial={{ opacity: 0, x: "6%", filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={switchingToVoice
                    ? { opacity: 0, x: "6%", filter: "blur(8px)", transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }
                    : { opacity: 0, scale: 0.96, filter: "blur(10px)" }
                }
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                className="fixed inset-0 z-50 flex flex-col overflow-hidden
                           bg-[#f0edf7] dark:bg-[#0d0b14] text-slate-900 dark:text-slate-100"
                style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif' }}
            >
                {/* ── Ambient gradients (violet/indigo palette mirrors voice panel teal/amber) ── */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[35%] -right-[15%] w-[90vw] h-[90vw] max-w-[900px] max-h-[900px]
                                   rounded-full bg-violet-300/20 dark:bg-violet-500/10 blur-[140px]"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-[35%] -left-[10%] w-[95vw] h-[95vw] max-w-[980px] max-h-[980px]
                                   rounded-full bg-indigo-300/20 dark:bg-indigo-600/10 blur-[160px]"
                    />
                    <div className="absolute inset-0 opacity-[0.18] dark:opacity-[0.10]
                                    [background-image:radial-gradient(rgba(15,23,42,0.14)_1px,transparent_1px)]
                                    [background-size:18px_18px]" />
                </div>

                {/* ── Scrollable content ── */}
                <div className="relative z-10 flex flex-col h-full overflow-y-auto px-6 sm:px-10 py-8">
                    <div className="mx-auto w-full max-w-3xl flex flex-col gap-8 flex-1">

                        {/* ── Top Bar ── */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Brand */}
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-400 shadow-[0_10px_30px_rgba(139,92,246,0.3)] flex items-center justify-center text-white">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Planora Text</p>
                                    <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Mentor Studio</p>
                                </div>
                            </div>

                            {/* Mode toggle pill */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center rounded-full bg-white/50 dark:bg-white/8 border border-white/70 dark:border-white/10 p-1 shadow-sm backdrop-blur-sm">
                                    {/* Voice — inactive */}
                                    <motion.button
                                        onClick={handleSwitchToVoice}
                                        whileHover={{ backgroundColor: "rgba(255,255,255,0.55)" }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-500 dark:text-slate-400 text-[12px] font-semibold transition-colors"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 1v22" /><path d="M8 5a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0z" /><path d="M5 11a7 7 0 0 0 14 0" />
                                        </svg>
                                        Voice
                                    </motion.button>
                                    {/* Text — active */}
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[12px] font-semibold select-none">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        Text
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-11 h-11 flex items-center justify-center rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 border border-white/70 dark:border-white/10 text-slate-700 dark:text-white/90 transition-all shadow-sm"
                                >
                                    <FaTimes size={18} />
                                </button>
                            </div>
                        </div>

                        {/* ── Input card ── */}
                        <div className="rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
                            <h2
                                className="text-3xl sm:text-[34px] leading-tight text-slate-900 dark:text-white"
                                style={{ fontFamily: '"Fraunces", "Playfair Display", serif' }}
                            >
                                Write it out, get clarity.
                            </h2>
                            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                                Share your goals, blockers, or questions and get structured, actionable guidance.
                            </p>

                            <div className="mt-6">
                                <textarea
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={5}
                                    placeholder="What are you working on? Any blockers or questions?"
                                    disabled={loading}
                                    className="w-full rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl text-slate-900 dark:text-white px-5 py-4 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-400/50 dark:focus:ring-violet-500/40 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-inner"
                                />
                                <div className="flex items-center justify-between mt-2 px-1">
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Ctrl + Enter to send</span>
                                    <span className={`text-[11px] font-semibold transition-colors ${transcript.length > 800 ? "text-rose-400" : "text-slate-400"}`}>
                                        {transcript.length}
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                onClick={handleSubmit}
                                disabled={loading || !transcript.trim()}
                                whileHover={{ scale: (!loading && transcript.trim()) ? 1.02 : 1 }}
                                whileTap={{ scale: (!loading && transcript.trim()) ? 0.98 : 1 }}
                                className={`mt-4 w-full px-6 py-4 rounded-2xl text-[15px] font-semibold tracking-wide transition-all flex items-center justify-center gap-3
                                    ${loading || !transcript.trim()
                                        ? "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                                        : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-[0_18px_40px_rgba(15,23,42,0.30)]"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Thinking...
                                    </>
                                ) : (
                                    <>
                                        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10">
                                            <FaPaperPlane size={14} />
                                        </span>
                                        Talk to Mentor
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* ── Error ── */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="rounded-2xl border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-900/20 backdrop-blur-xl px-5 py-4 text-sm text-rose-700 dark:text-rose-300"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── AI Response ── */}
                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                    className="rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] space-y-6"
                                >
                                    {/* Tone badge */}
                                    <div className="flex items-center gap-2">
                                        <FaSmile className="text-slate-400 text-xs" />
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${toneBadgeStyles[result.emotional_tone] || toneBadgeStyles.neutral}`}>
                                            {result.emotional_tone}
                                        </span>
                                    </div>

                                    {/* Mentor message */}
                                    <div className="rounded-2xl bg-violet-50/80 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 px-5 py-4">
                                        <p className="text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                                            {result.mentor_message}
                                        </p>
                                    </div>

                                    {/* Confidence */}
                                    <div>
                                        <div className="flex justify-between text-[12px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                                            <span>Confidence</span>
                                            <span>{Math.round((result.confidence_level || 0) * 100)}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(result.confidence_level || 0) * 100}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Clarity */}
                                    <div>
                                        <div className="flex justify-between text-[12px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                                            <span>Clarity</span>
                                            <span>{Math.round((result.clarity_level || 0) * 100)}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(result.clarity_level || 0) * 100}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Action items */}
                                    {result.action_items?.length > 0 && (
                                        <div>
                                            <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400 mb-3">
                                                Action Items
                                            </p>
                                            <ul className="space-y-2.5">
                                                {result.action_items.map((item, i) => (
                                                    <motion.li
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.3 + i * 0.08 }}
                                                        className="flex items-start gap-3 text-[14px] text-slate-700 dark:text-slate-300"
                                                    >
                                                        <FaCheckCircle className="text-violet-500 mt-0.5 flex-shrink-0 text-xs" />
                                                        <span>{item}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Ask again nudge */}
                                    <button
                                        onClick={() => setResult(null)}
                                        className="w-full py-3 rounded-2xl border border-white/70 dark:border-white/10 bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[13px] font-semibold hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
                                    >
                                        Ask another question
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="h-6" />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
