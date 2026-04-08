import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
// import { Canvas } from "@react-three/fiber"; // Removed 3D Canvas
// import VoiceAvatar3D from "./VoiceAvatar3D"; // Removed 3D Avatar
import AudioVisualizer from "./AudioVisualizer"; // New Visualizer
import { mentoringService } from "../../api/mentoringService";
import { assistantPipelineService } from "../../api/assistantPipelineService";
import env from "../../config/env";
import { useVoiceSession } from "../../hooks/useVoiceSession";
import { useVoicePipelineSession } from "../../hooks/useVoicePipelineSession";

/**
 * AIVoicePanel — Apple/ElevenLabs-style premium full-screen voice experience.
 *
 * Visuals:
 * - Fluid, deeply blurred glassmorphic overlay over the Dashboard.
 * - Centerpiece: A multi-layered, organic mesh orb that breathes with `audioLevel`.
 * - Clean, ultra-minimalist typography.
 *
 * Props: isOpen, onClose, contextSource, studentGoal
 */
export default function AIVoicePanel({
    isOpen = false,
    onClose,
    onSwitchToText,
    contextSource = "general",
    studentGoal = "",
    autoStart = false,
    onAutoStartHandled,
}) {
    // 'closed' | 'open' | 'minimized'
    const [panelState, setPanelState] = useState("closed");
    const [voiceConfig, setVoiceConfig] = useState(null);
    const [selectedVoice, setSelectedVoice] = useState("Aoede");
    const [sessionDuration, setSessionDuration] = useState(0);
    const [switchingToText, setSwitchingToText] = useState(false);
    const autoStartTriggeredRef = useRef(false);

    const realtimeSession = useVoiceSession();
    const pipelineSession = useVoicePipelineSession();
    const pipelineEnabled = env.AI_PIPELINE_ENABLED && env.AI_PIPELINE_CHANNELS.includes("voice");
    const session = pipelineEnabled ? pipelineSession : realtimeSession;

    const {
        status,
        error,
        transcript,
        isSpeaking,
        audioLevel,
        isCapturing,
        actionProposals = [],
        latestResult = null,
        startTurn = () => { },
        stopTurn = () => { },
        confirmProposal = async () => null,
        connect,
        disconnect,
    } = session;

    // Sync isOpen prop â†’ panelState
    useEffect(() => {
        if (isOpen && panelState === "closed") setPanelState("open");
        else if (!isOpen && panelState !== "closed") {
            disconnect();
            setPanelState("closed");
        }
    }, [isOpen, panelState, disconnect]);

    // Fetch voice config when panel opens
    useEffect(() => {
        if (panelState === "open" && !voiceConfig) {
            const loadConfig = async () => {
                try {
                    if (pipelineEnabled) {
                        const cfg = await assistantPipelineService.getConfig();
                        setVoiceConfig({
                            ws_url: "",
                            session_memory: [],
                            onboarding_context: {},
                            auto_intro_prompt: "",
                            available_voices: cfg?.available_voices || [],
                        });
                    } else {
                        const cfg = await mentoringService.getVoiceConfig();
                        setVoiceConfig(cfg);
                    }
                } catch (err) {
                    console.error("Voice config error:", err);
                }
            };
            loadConfig();
        }
    }, [panelState, voiceConfig, pipelineEnabled]);

    const isActive = status === "active";

    useEffect(() => {
        let interval;
        if (isActive) {
            interval = setInterval(() => setSessionDuration(s => s + 1), 1000);
        } else {
            setSessionDuration(0);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const formatTime = (s) => {
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleStart = useCallback((triggeredByAutoStart = false) => {
        if (!voiceConfig) return;
        connect({
            wsUrl: voiceConfig.ws_url,
            contextSource,
            studentGoal,
            sessionMemory: voiceConfig.session_memory,
            voiceName: selectedVoice,
            onboardingContext: voiceConfig.onboarding_context || {},
            initialPrompt: triggeredByAutoStart ? (voiceConfig.auto_intro_prompt || "") : "",
            languagePreference: "hinglish",
        });
    }, [voiceConfig, connect, contextSource, studentGoal, selectedVoice]);

    useEffect(() => {
        if (!isOpen) {
            autoStartTriggeredRef.current = false;
            return;
        }

        if (
            autoStart &&
            panelState === "open" &&
            voiceConfig &&
            status === "idle" &&
            !autoStartTriggeredRef.current
        ) {
            autoStartTriggeredRef.current = true;
            handleStart(true);
            onAutoStartHandled?.();
        }
    }, [isOpen, autoStart, panelState, voiceConfig, status, handleStart, onAutoStartHandled]);

    const handleClose = useCallback(() => {
        disconnect();
        setPanelState("closed");
        onClose?.();
    }, [disconnect, onClose]);

    const handleSwitchToText = useCallback(() => {
        setSwitchingToText(true);
        // Brief delay lets the exit animation play before text panel mounts
        setTimeout(() => {
            disconnect();
            setPanelState("closed");
            setSwitchingToText(false);
            onSwitchToText?.();
        }, 320);
    }, [disconnect, onSwitchToText]);

    // Calculate dynamic orb scale and glow based on audio level
    // Siri/ElevenLabs style organic breathing
    const baseScale = isActive ? 1.05 : 1;
    const dynamicScale = baseScale + (audioLevel * 0.4);
    const isIdle = status === "idle";
    const isConnecting = status === "connecting";
    const statusLabel = isConnecting
        ? "Connecting"
        : isActive
            ? (isSpeaking ? "Speaking" : (pipelineEnabled ? (isCapturing ? "Recording" : "Ready to record") : "Listening"))
            : "Ready";
    const endLabel = isConnecting ? "Cancel" : "End Session";
    const voiceLabel = selectedVoice.substring(0, 2).toLowerCase() === "ao"
        ? "US"
        : selectedVoice.substring(0, 2).toUpperCase();

    return (
        <AnimatePresence>
            {/* ─── Premium Full-Screen Modal ─── */}
            {panelState === "open" && (
                <motion.div
                    key="voice-fullscreen"
                    data-voice-overlay="true"
                    // Elegant scale-and-fade, like Apple iOS controls over backgrounds
                    initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={switchingToText
                        ? { opacity: 0, x: "-6%", filter: "blur(8px)", transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }
                        : { opacity: 0, scale: 0.96, filter: "blur(10px)" }
                    }
                    transition={{ type: "spring", damping: 25, stiffness: 120 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden
                               bg-[#f7f4ef] dark:bg-[#0b0f14] text-slate-900 dark:text-slate-100"
                    style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif' }}
                >
                    {/* Atmospheric Ambient Gradients */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-[35%] -left-[15%] w-[90vw] h-[90vw] max-w-[900px] max-h-[900px]
                                       rounded-full bg-teal-300/20 dark:bg-teal-400/10 blur-[140px]"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-[35%] -right-[10%] w-[95vw] h-[95vw] max-w-[980px] max-h-[980px]
                                       rounded-full bg-orange-300/20 dark:bg-orange-500/10 blur-[160px]"
                        />
                        <div className="absolute inset-0 opacity-[0.22] dark:opacity-[0.12]
                                        [background-image:radial-gradient(rgba(15,23,42,0.16)_1px,transparent_1px)]
                                        [background-size:18px_18px]" />
                        <div className="absolute inset-0 opacity-40 dark:opacity-20 mix-blend-soft-light
                                        [background-image:linear-gradient(120deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_35%),linear-gradient(0deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_60%)]" />
                    </div>

                    <div className="relative z-10 w-full px-6 sm:px-10">
                        <div className="mx-auto w-full max-w-6xl">
                            {/* Top Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 via-sky-400 to-amber-300 shadow-[0_10px_30px_rgba(16,185,129,0.25)] flex items-center justify-center text-white">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 1v22"></path>
                                            <path d="M8 5a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0z"></path>
                                            <path d="M5 11a7 7 0 0 0 14 0"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Planorah Voice</p>
                                        <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Mentor Studio</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Mode toggle pill */}
                                    <div className="flex items-center rounded-full bg-white/50 dark:bg-white/8 border border-white/70 dark:border-white/10 p-1 shadow-sm backdrop-blur-sm">
                                        {/* Voice — active pill */}
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[12px] font-semibold select-none">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 1v22" /><path d="M8 5a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0z" /><path d="M5 11a7 7 0 0 0 14 0" />
                                            </svg>
                                            Voice
                                        </div>
                                        {/* Text — inactive pill */}
                                        <motion.button
                                            onClick={handleSwitchToText}
                                            whileHover={{ backgroundColor: "rgba(255,255,255,0.55)" }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-500 dark:text-slate-400 text-[12px] font-semibold transition-colors"
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg>
                                            Text
                                        </motion.button>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="w-11 h-11 flex items-center justify-center rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 border border-white/70 dark:border-white/10 text-slate-700 dark:text-white/90 transition-all shadow-sm"
                                    >
                                        <FaTimes size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="mt-10 grid gap-8 lg:grid-cols-[1.45fr_0.9fr] items-start">
                                <div className="relative">
                                    <div className="rounded-[32px] border border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Live Waveform</p>
                                            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                                                <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-400" : isConnecting ? "bg-amber-400" : "bg-slate-400"}`} />
                                                {statusLabel}
                                            </div>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: dynamicScale }}
                                            transition={{ type: "spring", stiffness: 160, damping: 22 }}
                                            className="mt-6 h-[220px] sm:h-[250px] rounded-3xl overflow-hidden bg-gradient-to-br from-white/60 via-white/30 to-white/10 dark:from-white/10 dark:via-white/5 dark:to-transparent border border-white/50 dark:border-white/5"
                                        >
                                            <AudioVisualizer
                                                isSpeaking={isSpeaking}
                                                audioLevel={audioLevel}
                                            />
                                        </motion.div>

                                        <div className="mt-6 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <span className="uppercase tracking-[0.28em] text-[10px] text-slate-400 dark:text-slate-500">Session</span>
                                                <span className="font-semibold">{formatTime(sessionDuration)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[12px]">
                                                <span className={`px-3 py-1 rounded-full border ${isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-slate-200 bg-white/70 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"}`}>
                                                    {isActive ? "Live feedback" : "Ready when you are"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {transcript && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 12 }}
                                                className="mt-5"
                                            >
                                                <div className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl px-6 py-5 shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                                                    <p className="text-slate-400 dark:text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                                                        Live Transcript
                                                    </p>
                                                    <p className="text-slate-800 dark:text-white/80 text-[15px] leading-relaxed font-medium">
                                                        {transcript}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
                                        <h2
                                            className="text-3xl sm:text-[34px] leading-tight text-slate-900 dark:text-white"
                                            style={{ fontFamily: '"Fraunces", "Playfair Display", serif' }}
                                        >
                                            Brilliant conversation, instantly.
                                        </h2>
                                        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                                            Speak naturally, get real-time coaching, and finish with crisp, actionable feedback.
                                        </p>

                                        {isIdle && (
                                            <motion.button
                                                onClick={handleStart}
                                                disabled={!voiceConfig}
                                                whileHover={{ scale: voiceConfig ? 1.03 : 1 }}
                                                whileTap={{ scale: voiceConfig ? 0.98 : 1 }}
                                                className="mt-6 w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-[15px] font-semibold tracking-wide shadow-[0_18px_40px_rgba(15,23,42,0.35)] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                            >
                                                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                                    </svg>
                                                </span>
                                                {voiceConfig ? "Start Conversation" : "Initializing..."}
                                            </motion.button>
                                        )}

                                        {!isIdle && (
                                            <motion.button
                                                onClick={handleClose}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="mt-6 w-full px-6 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[15px] font-semibold tracking-wide shadow-[0_16px_30px_rgba(239,68,68,0.35)] transition-all flex items-center justify-center gap-3"
                                            >
                                                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                                                        <line x1="23" y1="1" x2="1" y2="23"></line>
                                                    </svg>
                                                </span>
                                                {endLabel}
                                            </motion.button>
                                        )}

                                        {pipelineEnabled && isActive && (
                                            <div className="mt-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
                                                    Push To Talk
                                                </p>
                                                <button
                                                    type="button"
                                                    onMouseDown={startTurn}
                                                    onMouseUp={stopTurn}
                                                    onMouseLeave={() => { if (isCapturing) stopTurn(); }}
                                                    onTouchStart={startTurn}
                                                    onTouchEnd={stopTurn}
                                                    className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isCapturing
                                                        ? "bg-emerald-600 text-white"
                                                        : "bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-white/20"
                                                        }`}
                                                >
                                                    {isCapturing ? "Release to send turn" : "Hold to speak"}
                                                </button>
                                            </div>
                                        )}

                                        {voiceConfig && (
                                            <div className="mt-6">
                                                <div className="flex items-center justify-between text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                                                    <span className="uppercase tracking-[0.3em]">Voice</span>
                                                    <span className="text-slate-700 dark:text-slate-200">{voiceLabel}</span>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-2">
                                                    {voiceConfig.available_voices.map((v) => (
                                                        <button
                                                            key={v.id}
                                                            onClick={() => setSelectedVoice(v.id)}
                                                            className={`px-3 py-2.5 rounded-2xl text-[13px] font-semibold transition-colors border ${selectedVoice === v.id
                                                                ? "bg-slate-900 text-white border-slate-900 shadow-[0_10px_25px_rgba(15,23,42,0.25)]"
                                                                : "bg-white/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-white/70 dark:border-white/10 hover:bg-white"
                                                                }`}
                                                        >
                                                            {v.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-[24px] border border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-2xl px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                        <p className="font-semibold text-slate-800 dark:text-white">Session flow</p>
                                        <p className="mt-2">
                                            {pipelineEnabled
                                                ? "Use push-to-talk turns for fast STT → LLM → TTS responses."
                                                : "Introduce your goal, talk for a minute, then ask for targeted feedback."}
                                        </p>
                                    </div>

                                    {pipelineEnabled && latestResult?.assistant_text && (
                                        <div className="rounded-[24px] border border-violet-200/70 dark:border-violet-800/40 bg-violet-50/70 dark:bg-violet-900/20 backdrop-blur-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-200">
                                            <p className="font-semibold text-violet-700 dark:text-violet-300 mb-1">Latest Response</p>
                                            <p>{latestResult.assistant_text}</p>
                                        </div>
                                    )}

                                    {pipelineEnabled && Array.isArray(actionProposals) && actionProposals.length > 0 && (
                                        <div className="rounded-[24px] border border-emerald-200/70 dark:border-emerald-800/40 bg-emerald-50/70 dark:bg-emerald-900/20 backdrop-blur-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-200 space-y-3">
                                            <p className="font-semibold text-emerald-700 dark:text-emerald-300">Confirm Actions</p>
                                            {actionProposals.map((proposal) => (
                                                <div key={proposal.proposal_id} className="rounded-xl border border-emerald-200 dark:border-emerald-800 p-3">
                                                    <p className="text-xs font-semibold mb-2">{proposal.summary}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmProposal(proposal.proposal_id, true)}
                                                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmProposal(proposal.proposal_id, false)}
                                                            className="px-3 py-1.5 text-xs rounded-lg bg-gray-200 dark:bg-charcoalMuted text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-charcoalMuted"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {error && (
                                        <p className="text-red-600 font-semibold bg-white/90 px-4 py-3 rounded-xl text-sm text-center border border-red-200">
                                            {error}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ─── Minimized floating orb (Unchanged logic, refined look) ─── */}
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
                        className={`flex items-center h-[42px] px-[10px] rounded-[24px] cursor-pointer transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.08)] border backdrop-blur-xl
                            ${isActive
                                ? 'bg-white/80 dark:bg-[#1c1c1e]/80 border-gray-200 dark:border-white/10 gap-3'
                                : 'bg-white/80 dark:bg-[#1c1c1e]/80 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#2c2c2e]/90 gap-2.5'
                            }`}
                    >
                        {/* The Orb */}
                        <motion.div className="relative w-[26px] h-[26px] rounded-full overflow-hidden shrink-0 shadow-[0_1px_3px_rgba(37,99,235,0.2)]">
                            <div className="absolute inset-0 bg-[#0f766e]" />
                            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(45,212,191,0.9)_120deg,rgba(56,189,248,0.9)_180deg,transparent_240deg)] animate-[spin_3s_linear_infinite]" />
                            <div className="absolute inset-[1px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.7)_0%,transparent_50%,rgba(0,0,0,0.2)_100%)] mix-blend-overlay border-[0.5px] border-white/20" />

                            {isActive && (
                                <motion.div
                                    className={`absolute inset-0 rounded-full ${isSpeaking ? "bg-amber-300/30" : "bg-teal-400/30"}`}
                                    animate={{
                                        scale: [1, 1.4 + audioLevel * 0.4, 1],
                                        opacity: [0.6, 0, 0.6],
                                    }}
                                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                                />
                            )}
                        </motion.div>

                        <div className="overflow-hidden flex items-center pr-1">
                            {!isActive ? (
                                <span className="text-[15px] font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                    Voice chat
                                </span>
                            ) : (
                                <div className="flex items-center gap-3 whitespace-nowrap">
                                    <span className="text-[15px] font-bold text-gray-700 dark:text-gray-200 w-[42px] text-center tracking-tight">
                                        {formatTime(sessionDuration)}
                                    </span>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClose();
                                        }}
                                        className="w-[28px] h-[28px] flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/40 transition-colors text-red-600 dark:text-red-400 ml-1"
                                        title="End Session"
                                    >
                                        <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="14" width="14">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
