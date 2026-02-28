import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBrain, FaMinus } from "react-icons/fa";
import { HiMicrophone } from "react-icons/hi";
import { mentoringService } from "../../api/mentoringService";
import { useVoiceSession } from "../../hooks/useVoiceSession";

/**
 * AIVoicePanel — ChatGPT-style full-screen voice experience.
 *
 * Entry:  Dark circle expands from the FAB (bottom-right) to fill the screen.
 * Active: Pulsing orb with audio level bars. Auto-captures the Planora page
 *         via html2canvas so the AI can see what the user is looking at.
 * Minimize: Collapses to a small floating orb (session stays active).
 * Close:  Circle shrinks back and session ends.
 *
 * Props: isOpen, onClose, contextSource, studentGoal
 */
export default function AIVoicePanel({
    isOpen = false,
    onClose,
    contextSource = "general",
    studentGoal = "",
}) {
    // 'closed' | 'open' | 'minimized'
    const [panelState, setPanelState] = useState("closed");
    const [voiceConfig, setVoiceConfig] = useState(null);
    const [selectedVoice, setSelectedVoice] = useState("Aoede");

    const {
        status,
        error,
        transcript,
        isSpeaking,
        isCapturing,
        audioLevel,
        connect,
        disconnect,
    } = useVoiceSession();

    // Sync isOpen prop â†’ panelState
    useEffect(() => {
        if (isOpen && panelState === "closed") setPanelState("open");
        else if (!isOpen && panelState !== "closed") {
            disconnect();
            setPanelState("closed");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Fetch voice config when panel opens
    useEffect(() => {
        if (panelState === "open" && !voiceConfig) {
            mentoringService
                .getVoiceConfig()
                .then(setVoiceConfig)
                .catch((err) => console.error("Voice config error:", err));
        }
    }, [panelState, voiceConfig]);

    const handleStart = useCallback(() => {
        if (!voiceConfig) return;
        connect({
            wsUrl: voiceConfig.ws_url,
            contextSource,
            studentGoal,
            sessionMemory: voiceConfig.session_memory,
            voiceName: selectedVoice,
        });
    }, [voiceConfig, connect, contextSource, studentGoal, selectedVoice]);

    const handleClose = useCallback(() => {
        disconnect();
        setPanelState("closed");
        onClose?.();
    }, [disconnect, onClose]);

    const isActive = status === "active";

    return (
        <AnimatePresence>
            {/* â”€â”€ Full-screen panel â”€â”€ */}
            {panelState === "open" && (
                <motion.div
                    key="voice-fullscreen"
                    data-voice-overlay="true"
                    /* Circle expands from the FAB position (bottom-right) */
                    initial={{ clipPath: "circle(0% at calc(100% - 52px) calc(100% - 52px))" }}
                    animate={{ clipPath: "circle(150% at calc(100% - 52px) calc(100% - 52px))" }}
                    exit={{ clipPath: "circle(0% at calc(100% - 52px) calc(100% - 52px))" }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden
                               bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950"
                >
                    {/* Ambient glow blobs */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.45, 0.25] }}
                            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-20 -left-20 w-[500px] h-[500px]
                                       rounded-full bg-indigo-600/20 blur-3xl"
                        />
                        <motion.div
                            animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.35, 0.15] }}
                            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                            className="absolute -bottom-20 -right-20 w-[400px] h-[400px]
                                       rounded-full bg-purple-600/20 blur-3xl"
                        />
                    </div>

                    {/* Top bar */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5 z-10">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <FaBrain className="text-indigo-400 text-xs" />
                            </div>
                            <span className="text-white/50 text-sm font-medium capitalize tracking-wide">
                                AI Mentor Â· {contextSource}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPanelState("minimized")}
                                title="Minimize"
                                className="p-2.5 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <FaMinus className="text-xs" />
                            </button>
                            <button
                                onClick={handleClose}
                                title="Close"
                                className="p-2.5 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Central orb */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="relative flex items-center justify-center"
                    >
                        {/* Outer glow rings â€” animate with audio level */}
                        {isActive &&
                            [140, 190, 250].map((size, i) => (
                                <motion.div
                                    key={size}
                                    className="absolute rounded-full border border-indigo-400/20"
                                    animate={{
                                        scale: [
                                            1,
                                            1 + (i + 1) * 0.12 + audioLevel * 0.4,
                                            1,
                                        ],
                                        opacity: [0.5 - i * 0.12, 0.05, 0.5 - i * 0.12],
                                    }}
                                    transition={{
                                        duration: 2.2 + i * 0.4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.25,
                                    }}
                                    style={{ width: size, height: size }}
                                />
                            ))}

                        {/* Core orb */}
                        <motion.div
                            animate={{
                                scale: isActive ? 1 + audioLevel * 0.2 : 1,
                                boxShadow: isSpeaking
                                    ? "0 0 80px 30px rgba(168,85,247,0.35), 0 0 160px 60px rgba(168,85,247,0.1)"
                                    : isActive
                                    ? `0 0 ${50 + audioLevel * 80}px ${15 + audioLevel * 30}px rgba(99,102,241,0.3)`
                                    : "0 0 50px 15px rgba(99,102,241,0.15)",
                            }}
                            transition={{ duration: 0.12 }}
                            className={`relative w-40 h-40 rounded-full flex items-center justify-center
                                ${
                                    isSpeaking
                                        ? "bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600"
                                        : isActive
                                        ? "bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600"
                                        : "bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700"
                                }`}
                        >
                            {isActive ? (
                                /* Audio level bars */
                                <div className="flex gap-1.5 items-end h-12">
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1 bg-white/90 rounded-full"
                                            animate={{
                                                height: isSpeaking
                                                    ? [
                                                          5,
                                                          20 + ((i * 7) % 18),
                                                          10,
                                                          28 - ((i * 5) % 14),
                                                          5,
                                                      ]
                                                    : [4, 4 + audioLevel * 30, 4],
                                            }}
                                            transition={{
                                                duration: isSpeaking ? 0.55 + i * 0.07 : 0.22,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: i * 0.06,
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <HiMicrophone className="text-white/80 text-5xl" />
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Status text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="mt-10 text-center px-6"
                    >
                        <p className="text-white text-2xl font-extralight tracking-wide">
                            {status === "idle" && "Ready to talk"}
                            {status === "connecting" && "Connectingâ€¦"}
                            {status === "active" &&
                                (isSpeaking ? "Mentor is speakingâ€¦" : "Listeningâ€¦")}
                            {status === "error" && "Something went wrong"}
                        </p>

                        {/* Screen capture indicator */}
                        <AnimatePresence>
                            {isCapturing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-3 flex items-center justify-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-green-400/70 text-xs tracking-wide">
                                        Mentor can see this page
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <p className="text-red-400/80 text-sm mt-3 max-w-xs mx-auto leading-relaxed">
                                {error}
                            </p>
                        )}
                    </motion.div>

                    {/* Transcript */}
                    <AnimatePresence>
                        {transcript && (
                            <motion.div
                                initial={{ opacity: 0, y: 12, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 mx-auto w-full max-w-sm px-6"
                            >
                                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl px-5 py-4 max-h-32 overflow-y-auto">
                                    <p className="text-white/30 text-[11px] mb-1.5 uppercase tracking-widest">
                                        Transcript
                                    </p>
                                    <p className="text-white/70 text-sm leading-relaxed">
                                        {transcript}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Controls */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="mt-10 flex items-center gap-4"
                    >
                        {status === "idle" && (
                            <button
                                onClick={handleStart}
                                disabled={!voiceConfig}
                                className="px-10 py-3.5 rounded-full bg-indigo-500 hover:bg-indigo-400
                                           text-white font-medium tracking-wide transition-all
                                           shadow-lg shadow-indigo-500/30 disabled:opacity-40
                                           disabled:cursor-not-allowed"
                            >
                                {voiceConfig ? "Start Session" : "Loadingâ€¦"}
                            </button>
                        )}
                        {status === "connecting" && (
                            <div className="flex items-center gap-3 text-white/50 text-sm">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                                Connectingâ€¦
                            </div>
                        )}
                        {isActive && (
                            <button
                                onClick={handleClose}
                                className="px-10 py-3.5 rounded-full bg-red-500/15 hover:bg-red-500/25
                                           text-red-400 border border-red-500/30 font-medium tracking-wide
                                           transition-all"
                            >
                                End Session
                            </button>
                        )}
                    </motion.div>

                    {/* Voice picker â€” only when idle */}
                    <AnimatePresence>
                        {status === "idle" && voiceConfig && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.65 }}
                                className="mt-6 flex flex-wrap gap-2 justify-center px-6"
                            >
                                {voiceConfig.available_voices.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVoice(v.id)}
                                        title={v.description}
                                        className={`px-4 py-1.5 rounded-full text-xs transition-all border
                                            ${
                                                selectedVoice === v.id
                                                    ? "bg-indigo-500/25 text-indigo-300 border-indigo-500/50"
                                                    : "bg-white/5 text-white/35 border-white/10 hover:bg-white/10 hover:text-white/60"
                                            }`}
                                    >
                                        {v.name}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* â”€â”€ Minimized floating orb â”€â”€ */}
            {panelState === "minimized" && (
                <motion.div
                    key="voice-minimized"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="fixed bottom-6 right-6 z-50"
                    data-voice-overlay="true"
                >
                    <button
                        onClick={() => setPanelState("open")}
                        title="Expand AI Mentor"
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center
                            shadow-2xl transition-transform hover:scale-105 active:scale-95
                            ${
                                isSpeaking
                                    ? "bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/50"
                                    : "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/40"
                            }`}
                    >
                        {/* Pulse ring */}
                        {isActive && (
                            <motion.div
                                className={`absolute inset-0 rounded-full ${
                                    isSpeaking ? "bg-purple-400/30" : "bg-indigo-400/30"
                                }`}
                                animate={{
                                    scale: [1, 1.6 + audioLevel * 0.5, 1],
                                    opacity: [0.6, 0, 0.6],
                                }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                            />
                        )}
                        <FaBrain className="text-white text-xl relative z-10" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
