import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Mic, Minus, SquarePen, X } from "lucide-react";
import { mentoringService } from "../../api/mentoringService";
import { assistantPipelineService } from "../../api/assistantPipelineService";
import { getContextSourceFromPath } from "../../utils/assistantContext";
import env from "../../config/env";
import { useVoiceSession } from "../../hooks/useVoiceSession";
import { useVoicePipelineSession } from "../../hooks/useVoicePipelineSession";

const FONT_URL =
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,500;12..96,700&family=Instrument+Serif:ital@0;1&display=swap";

const DEFAULT_VOICE = "Aoede";

const CONTEXT_LABELS = {
    roadmap: "Roadmap",
    dashboard: "Dashboard",
    tasks: "Tasks",
    resume: "Resume",
    ats: "ATS",
    interview: "Interview",
    portfolio: "Portfolio",
    projects: "Projects",
    planora: "Planora",
    scheduler: "Scheduler",
    lab: "Lab",
    general: "General",
};

const makeEntry = (role, content) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
});

const getPrimaryVoiceId = (config) => {
    if (!config?.available_voices?.length) return DEFAULT_VOICE;
    const first = config.available_voices[0];
    if (typeof first === "string") return first;
    return first?.id || DEFAULT_VOICE;
};

function injectFont() {
    if (document.getElementById("planorah-voice-fonts")) return;
    const link = document.createElement("link");
    link.id = "planorah-voice-fonts";
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
}

function SessionIndicator({ size = 48, isActive = false, isSpeaking = false, status = "idle" }) {
    const stateClass =
        status === "connecting"
            ? "border-amber-300/60 bg-amber-50 text-amber-700"
            : status === "processing"
                ? "border-sky-300/60 bg-sky-50 text-sky-700"
                : isSpeaking
                    ? "border-teal-400/60 bg-teal-50 text-teal-700"
                    : isActive
                        ? "border-emerald-400/60 bg-emerald-50 text-emerald-700"
                        : "border-borderMuted bg-white text-textSecondary dark:border-white/10 dark:bg-charcoalDark dark:text-gray-300";

    return (
        <div
            className={`inline-flex items-center justify-center rounded-2xl border ${stateClass}`}
            style={{ width: size, height: size, flexShrink: 0 }}
        >
            <Mic size={size <= 28 ? 12 : 18} strokeWidth={2.3} />
        </div>
    );
}

function MiniPill({ isActive, isSpeaking, status, sessionDuration, formatTime, onExpand, onClose }) {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="fixed bottom-5 right-4 z-[9999]"
            data-voice-overlay="true"
        >
            <div className="flex items-center gap-2 rounded-full border-2 border-borderMuted bg-white/95 px-2 py-1.5 shadow-[0_8px_20px_rgba(47,39,32,0.2)] backdrop-blur-md dark:border-white/10 dark:bg-charcoal/95">
                <button
                    type="button"
                    onClick={onExpand}
                    className="flex items-center gap-2"
                >
                    <SessionIndicator size={26} isActive={isActive} isSpeaking={isSpeaking} status={status} />
                    <span className="text-sm font-semibold text-textPrimary dark:text-white">
                        {isActive ? formatTime(sessionDuration) : "Voice"}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-borderMuted bg-white text-textSecondary hover:bg-beigeSecondary dark:border-white/10 dark:bg-charcoalDark dark:text-gray-300 dark:hover:bg-charcoalMuted"
                    title="Close"
                >
                    <X size={13} strokeWidth={2.3} />
                </button>
            </div>
        </motion.div>
    );
}

function VoiceHistory({ history, loading }) {
    if (history.length === 0 && !loading) {
        return null;
    }

    return (
        <div className="space-y-2">
            {history.map((entry) => (
                <div key={entry.id} className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${entry.role === "user"
                        ? "rounded-br-md bg-terracotta text-white"
                        : "rounded-bl-md border border-borderMuted bg-white text-textPrimary dark:border-white/10 dark:bg-charcoal dark:text-gray-100"
                        }`}>
                        {entry.content}
                    </div>
                </div>
            ))}

            {loading && (
                <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-borderMuted bg-white px-3 py-2 text-sm text-textSecondary dark:border-white/10 dark:bg-charcoal dark:text-gray-400">
                        Quicky is processing your voice...
                    </div>
                </div>
            )}
        </div>
    );
}

function SpinIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animation: "spin 0.9s linear infinite" }}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

export default function AIVoicePanel({
    isOpen = false,
    onClose,
    onSwitchToText,
    contextSource: contextSourceProp = "general",
    studentGoal = "",
    autoStart = false,
    onAutoStartHandled,
}) {
    const contextSource = contextSourceProp !== "general"
        ? contextSourceProp
        : (typeof window !== "undefined" ? getContextSourceFromPath(window.location.pathname) : "general");

    const contextLabel = useMemo(() => CONTEXT_LABELS[contextSource] || "General", [contextSource]);

    const [panelState, setPanelState] = useState("closed");
    const [voiceConfig, setVoiceConfig] = useState(null);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [history, setHistory] = useState([]);

    const autoStartTriggeredRef = useRef(false);
    const lastTurnKeyRef = useRef("");
    const historyRef = useRef(null);

    const realtimeSession = useVoiceSession();
    const pipelineSession = useVoicePipelineSession(contextSource);
    const pipelineEnabled = env.AI_PIPELINE_ENABLED && env.AI_PIPELINE_CHANNELS.includes("voice");
    const session = pipelineEnabled ? pipelineSession : realtimeSession;

    const {
        status = "idle",
        error,
        transcript,
        isSpeaking = false,
        isCapturing = false,
        latestResult = null,
        actionProposals = [],
        startTurn = () => { },
        stopTurn = () => { },
        confirmProposal = async () => null,
        connect,
        disconnect,
        clearConversation,
    } = session;

    const isActive = status === "active";

    useEffect(() => {
        injectFont();
    }, []);

    useEffect(() => {
        if (isOpen && panelState === "closed") {
            setPanelState("expanded");
            return;
        }
        if (!isOpen && panelState !== "closed") {
            disconnect?.();
            setPanelState("closed");
        }
    }, [disconnect, isOpen, panelState]);

    useEffect(() => {
        if (panelState === "closed" || voiceConfig) return;

        (async () => {
            try {
                if (pipelineEnabled) {
                    const cfg = await assistantPipelineService.getConfig();
                    const voices = cfg?.available_voices || [];
                    setVoiceConfig({
                        ws_url: "",
                        session_memory: [],
                        onboarding_context: {},
                        auto_intro_prompt: "",
                        available_voices: voices,
                    });
                } else {
                    const cfg = await mentoringService.getVoiceConfig();
                    setVoiceConfig(cfg);
                }
            } catch (cfgErr) {
                console.error("Voice config error", cfgErr);
            }
        })();
    }, [panelState, pipelineEnabled, voiceConfig]);

    useEffect(() => {
        let timer;
        if (isActive) {
            timer = setInterval(() => setSessionDuration((prev) => prev + 1), 1000);
        } else {
            setSessionDuration(0);
        }
        return () => clearInterval(timer);
    }, [isActive]);

    useEffect(() => {
        if (!isOpen) {
            autoStartTriggeredRef.current = false;
            return;
        }

        if (autoStart && panelState === "expanded" && voiceConfig && status === "idle" && !autoStartTriggeredRef.current) {
            autoStartTriggeredRef.current = true;
            handleStart(true);
            onAutoStartHandled?.();
        }
    }, [autoStart, isOpen, onAutoStartHandled, panelState, status, voiceConfig]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!latestResult) return;
        const userText = String(latestResult?.transcript || "").trim();
        const assistantText = String(latestResult?.assistant_text || "").trim();
        if (!userText && !assistantText) return;

        const turnKey = `${userText}|${assistantText}`;
        if (lastTurnKeyRef.current === turnKey) return;
        lastTurnKeyRef.current = turnKey;

        setHistory((prev) => {
            const next = [...prev];
            if (userText) next.push(makeEntry("user", userText));
            if (assistantText) next.push(makeEntry("assistant", assistantText));
            return next.slice(-80);
        });
    }, [latestResult]);

    useEffect(() => {
        if (panelState !== "expanded") return;
        historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
    }, [history, panelState]);

    const hasFeedContent = useMemo(() => (
        history.length > 0 ||
        Boolean(transcript) ||
        (Array.isArray(actionProposals) && actionProposals.length > 0) ||
        Boolean(error) ||
        status === "processing"
    ), [actionProposals, error, history.length, status, transcript]);

    const formatTime = (seconds) =>
        `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

    const handleStart = useCallback((byAutoStart = false) => {
        if (!voiceConfig) return;
        connect?.({
            wsUrl: voiceConfig.ws_url,
            contextSource,
            studentGoal,
            sessionMemory: voiceConfig.session_memory,
            voiceName: getPrimaryVoiceId(voiceConfig),
            onboardingContext: voiceConfig.onboarding_context || {},
            initialPrompt: byAutoStart ? (voiceConfig.auto_intro_prompt || "") : "",
            languagePreference: "hinglish",
        });
    }, [connect, contextSource, studentGoal, voiceConfig]);

    const handleEndSession = useCallback(() => {
        disconnect?.();
    }, [disconnect]);

    const handleClosePanel = useCallback(() => {
        disconnect?.();
        setPanelState("closed");
        onClose?.();
    }, [disconnect, onClose]);

    const handleMinimize = useCallback(() => {
        setPanelState("mini");
    }, []);

    const handleExpand = useCallback(() => {
        setPanelState("expanded");
    }, []);

    const handleNewSession = useCallback(() => {
        disconnect?.();
        clearConversation?.();
        setHistory([]);
        setSessionDuration(0);
        setPanelState("expanded");
        lastTurnKeyRef.current = "";
    }, [clearConversation, disconnect]);

    const handleSwitchToText = useCallback(() => {
        disconnect?.();
        setPanelState("closed");
        onSwitchToText?.();
    }, [disconnect, onSwitchToText]);

    const statusLabel =
        status === "connecting"
            ? "Connecting"
            : status === "processing"
                ? "Processing"
                : isActive
                    ? (isSpeaking ? "Speaking" : (pipelineEnabled ? (isCapturing ? "Recording" : "Ready") : "Listening"))
                    : "Ready";

    return (
        <AnimatePresence>
            {panelState === "expanded" && (
                <motion.div
                    key="quicky-voice-expanded"
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className="fixed bottom-4 left-3 right-3 z-[9999] ml-auto w-[calc(100vw-24px)] max-w-[430px] overflow-hidden rounded-3xl shadow-[0_14px_36px_rgba(0,0,0,0.18)] backdrop-blur-md"
                    style={{ background: 'var(--el-bg-secondary)', border: '1px solid var(--el-border)' }}
                    data-voice-overlay="true"
                >
                    <div className="flex items-center justify-between gap-2 px-3 py-3" style={{ borderBottom: '1px solid var(--el-border)' }}>
                        <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-terracotta/30 bg-terracotta/10 text-2xl">
                                🦉
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-textPrimary dark:text-white">Quicky Voice</p>
                                <p className="truncate text-xs font-medium text-textSecondary dark:text-gray-400">{contextLabel}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleNewSession}
                                title="New session"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-borderMuted bg-white text-textSecondary transition-colors hover:bg-beigeSecondary dark:border-white/10 dark:bg-charcoalDark dark:text-gray-300 dark:hover:bg-charcoalMuted"
                            >
                                <SquarePen size={15} strokeWidth={2.2} />
                            </button>
                            <button
                                type="button"
                                onClick={handleMinimize}
                                title="Minimize"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-borderMuted bg-white text-textSecondary transition-colors hover:bg-beigeSecondary dark:border-white/10 dark:bg-charcoalDark dark:text-gray-300 dark:hover:bg-charcoalMuted"
                            >
                                <Minus size={16} strokeWidth={2.4} />
                            </button>
                            <button
                                type="button"
                                onClick={handleClosePanel}
                                title="Close"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-borderMuted bg-white text-textSecondary transition-colors hover:bg-beigeSecondary dark:border-white/10 dark:bg-charcoalDark dark:text-gray-300 dark:hover:bg-charcoalMuted"
                            >
                                <X size={15} strokeWidth={2.4} />
                            </button>
                        </div>
                    </div>

                    <div className="px-3 pb-4 pt-4" style={{ borderBottom: '1px solid var(--el-border)' }}>
                        <div className="rounded-2xl p-3" style={{ border: '1px solid var(--el-border)', background: 'var(--el-bg)' }}>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <SessionIndicator size={48} isActive={isActive} isSpeaking={isSpeaking} status={status} />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-textPrimary dark:text-white">{statusLabel}</p>
                                        <p className="truncate text-xs text-textSecondary dark:text-gray-400">
                                            {isActive ? "Voice session in progress" : "Start when you are ready"}
                                        </p>
                                    </div>
                                </div>

                                {isActive && (
                                    <span className="rounded-full border border-borderMuted bg-white px-3 py-1 text-xs font-semibold tracking-wide text-textPrimary dark:border-white/10 dark:bg-charcoal dark:text-gray-200">
                                        {formatTime(sessionDuration)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {hasFeedContent && (
                        <div ref={historyRef} className="max-h-[28vh] space-y-2 overflow-y-auto px-3 py-3" style={{ background: 'var(--el-bg)' }}>
                            <VoiceHistory history={history} loading={status === "processing"} />

                            {transcript && (
                                <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 px-3 py-2 text-xs text-textSecondary dark:border-terracotta/40 dark:bg-terracotta/10 dark:text-gray-300">
                                    <span className="font-semibold text-terracotta">Live transcript:</span> {transcript}
                                </div>
                            )}

                            {Array.isArray(actionProposals) && actionProposals.length > 0 && (
                                <div className="space-y-2">
                                    {actionProposals.map((proposal) => (
                                        <div key={proposal.proposal_id} className="rounded-xl border border-terracotta/25 bg-beigeSecondary/70 p-2 dark:border-terracotta/35 dark:bg-charcoalMuted/60">
                                            <p className="mb-2 text-xs font-semibold text-textPrimary dark:text-gray-200">{proposal.summary}</p>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => confirmProposal(proposal.proposal_id, true)}
                                                    className="rounded-lg bg-terracotta px-2.5 py-1 text-xs font-semibold text-white hover:bg-terracottaHover"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => confirmProposal(proposal.proposal_id, false)}
                                                    className="rounded-lg border border-borderMuted bg-white px-2.5 py-1 text-xs font-semibold text-textSecondary hover:bg-beigeSecondary dark:border-white/10 dark:bg-charcoal dark:text-gray-300 dark:hover:bg-charcoalMuted"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2 p-3">
                        {status === "idle" && !hasFeedContent && (
                            <div className="rounded-xl px-3 py-2.5" style={{ border: '1px solid var(--el-border)', background: 'var(--el-bg-secondary)' }}>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-textSecondary dark:text-gray-400">
                                    What Quicky Does
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-textSecondary dark:text-gray-300">
                                    Quicky listens to your request, gives focused guidance for this page, and asks for confirmation before taking actions.
                                </p>
                            </div>
                        )}

                        {isActive && pipelineEnabled && (
                            <button
                                type="button"
                                onMouseDown={startTurn}
                                onMouseUp={stopTurn}
                                onMouseLeave={() => {
                                    if (isCapturing) stopTurn();
                                }}
                                onTouchStart={startTurn}
                                onTouchEnd={stopTurn}
                                className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${isCapturing
                                    ? "border-terracotta bg-terracotta text-white"
                                    : "border-borderMuted bg-white text-textSecondary hover:bg-beigeSecondary dark:border-white/10 dark:bg-charcoalDark dark:text-gray-300 dark:hover:bg-charcoalMuted"
                                    }`}
                            >
                                {isCapturing ? "Release to send" : "Hold to speak"}
                            </button>
                        )}

                        {status === "idle" ? (
                            <motion.button
                                type="button"
                                onClick={() => handleStart(false)}
                                disabled={!voiceConfig}
                                whileHover={voiceConfig ? { scale: 1.01 } : {}}
                                whileTap={voiceConfig ? { scale: 0.98 } : {}}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta px-3 py-3 text-sm font-bold text-white shadow-[0_6px_20px_rgba(217,108,74,0.28)] disabled:cursor-not-allowed disabled:bg-beigeMuted dark:disabled:bg-charcoalMuted"
                            >
                                {!voiceConfig ? <SpinIcon /> : <Mic size={15} strokeWidth={2.2} />}
                                {!voiceConfig ? "Initializing" : "Start voice session"}
                            </motion.button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleEndSession}
                                className="w-full rounded-xl border border-red-300 bg-red-50 px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                            >
                                End session
                            </button>
                        )}

                        <div className="flex items-center justify-center rounded-xl p-1" style={{ border: '1px solid var(--el-border)', background: 'var(--el-bg-secondary)' }}>
                            <div className="grid w-full max-w-[240px] grid-cols-2 gap-1 rounded-lg p-1" style={{ background: 'var(--el-bg)' }}>
                                <span className="inline-flex items-center justify-center gap-1 rounded-md bg-terracotta px-3 py-1 text-xs font-semibold text-white">
                                    <Mic size={11} strokeWidth={2.2} />
                                    Voice
                                </span>
                                <button
                                    type="button"
                                    onClick={handleSwitchToText}
                                    className="inline-flex items-center justify-center gap-1 rounded-md px-3 py-1 text-xs font-semibold text-textSecondary hover:bg-white dark:text-gray-300 dark:hover:bg-charcoal"
                                >
                                    <MessageSquare size={11} strokeWidth={2.2} />
                                    Text
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {panelState === "mini" && (
                <MiniPill
                    key="quicky-voice-mini"
                    isActive={isActive}
                    isSpeaking={isSpeaking}
                    status={status}
                    sessionDuration={sessionDuration}
                    formatTime={formatTime}
                    onExpand={handleExpand}
                    onClose={handleClosePanel}
                />
            )}
        </AnimatePresence>
    );
}
