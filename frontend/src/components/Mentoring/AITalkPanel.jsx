import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mentoringService } from "../../api/mentoringService";
import { assistantPipelineService } from "../../api/assistantPipelineService";
import { getContextSourceFromPath, buildFrontendAssistantContext } from "../../utils/assistantContext";
import env from "../../config/env";

/* ─── Tone accent map ─────────────────────────────────────────────────────── */
const TONE = {
  encouraging: { color: "#34D399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.22)"  },
  empathetic:  { color: "#60A5FA", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.22)"  },
  motivating:  { color: "#FBBF24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.22)"  },
  neutral:     { color: "#94A3B8", bg: "rgba(148,163,184,0.08)",border: "rgba(148,163,184,0.18)" },
  supportive:  { color: "#A78BFA", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.22)" },
  challenging: { color: "#FB7185", bg: "rgba(251,113,133,0.1)", border: "rgba(251,113,133,0.22)" },
  celebratory: { color: "#F472B6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.22)" },
};

/* ─── Context meta (same as AIVoicePanel) ────────────────────────────────── */
const CTX = {
  roadmap:   { icon: "🗺️", label: "Roadmap",   color: "#818CF8" },
  dashboard: { icon: "⚡",  label: "Dashboard", color: "#FBBF24" },
  tasks:     { icon: "✅",  label: "Tasks",     color: "#34D399" },
  resume:    { icon: "📄",  label: "Resume",    color: "#60A5FA" },
  ats:       { icon: "🎯",  label: "ATS Scan",  color: "#F472B6" },
  interview: { icon: "🎤",  label: "Interview", color: "#A78BFA" },
  portfolio: { icon: "🌐",  label: "Portfolio", color: "#2DD4BF" },
  projects:  { icon: "⚙️",  label: "Projects",  color: "#FB923C" },
  planora:   { icon: "📚",  label: "Planora",   color: "#22D3EE" },
  scheduler: { icon: "📅",  label: "Scheduler", color: "#86EFAC" },
  general:   { icon: "🤖",  label: "General",   color: "#94A3B8" },
};

/* ─── Icon button ─────────────────────────────────────────────────────────── */
function IconBtn({ onClick, children, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: danger ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.06)",
        border: danger ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.08)",
        color: danger ? "#F87171" : "rgba(255,255,255,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", outline: "none",
      }}
    >
      {children}
    </button>
  );
}

/* ─── Indigo "text" orb ───────────────────────────────────────────────────── */
function TextOrb({ loading }) {
  return (
    <motion.div
      animate={loading ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width: 52, height: 52, borderRadius: "50%",
        position: "relative", overflow: "hidden", flexShrink: 0,
        background:
          "radial-gradient(circle at 40% 33%, #C4B5FD 0%, #818CF8 20%, #4F46E5 55%, #1E1B4B 85%, #06050F 100%)",
        boxShadow:
          "inset 0 -5px 16px rgba(0,0,0,0.5), inset 0 5px 14px rgba(196,181,253,0.18), 0 0 24px rgba(129,140,248,0.25), 0 10px 32px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.55) 0%, transparent 42%)", mixBlendMode: "overlay" }} />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: loading ? 2 : 8, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", inset: 0,
          background: "conic-gradient(from 0deg, transparent 0deg, rgba(196,181,253,0.5) 60deg, rgba(56,189,248,0.5) 120deg, transparent 200deg)",
          mixBlendMode: "overlay",
        }}
      />
      {/* Chat icon */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function AITalkPanel({
  contextSource: contextSourceProp = "general",
  studentGoal = "",
  currentProgress = "",
  isOpen = false,
  onClose,
  onSwitchToVoice,
}) {
  const contextSource = contextSourceProp !== "general"
    ? contextSourceProp
    : (typeof window !== "undefined" ? getContextSourceFromPath(window.location.pathname) : "general");

  const [transcript,      setTranscript]      = useState("");
  const [loading,         setLoading]         = useState(false);
  const [result,          setResult]          = useState(null);
  const [error,           setError]           = useState("");
  const [switchingToVoice, setSwitchingToVoice] = useState(false);
  const [conversationId,  setConversationId]  = useState(null);

  const pipelineEnabled = env.AI_PIPELINE_ENABLED && env.AI_PIPELINE_CHANNELS.includes("text");
  const ctx = CTX[contextSource] || CTX.general;
  const goalChip = studentGoal ? studentGoal.slice(0, 32) + (studentGoal.length > 32 ? "…" : "") : null;

  const handleSubmit = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      if (pipelineEnabled) {
        const pathname = typeof window !== "undefined" ? window.location.pathname : "/dashboard";
        const data = await assistantPipelineService.sendTextTurn({
          message: transcript.trim(),
          contextSource,
          frontendContext: buildFrontendAssistantContext({ pathname, visiblePanel: "ai_talk_panel", metadata: { student_goal: studentGoal, current_progress: currentProgress } }),
          conversationId,
          languagePreference: "hinglish",
        });
        if (data?.conversation_id) setConversationId(data.conversation_id);
        setResult(data);
      } else {
        const data = await mentoringService.createSession({
          context_source: contextSource,
          student_goal: studentGoal,
          current_progress: currentProgress,
          transcript: transcript.trim(),
        });
        setResult(data);
      }
      setTranscript("");
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProposalDecision = useCallback(async (proposalId, confirmed) => {
    if (!pipelineEnabled || !conversationId || !proposalId) return;
    setLoading(true);
    try {
      const response = await assistantPipelineService.confirmAction({
        conversationId, proposalId, confirmed,
        idempotencyKey: `${conversationId}:${proposalId}:${confirmed ? "yes" : "no"}`,
      });
      setResult((prev) => ({
        ...(prev || {}),
        action_proposals: (prev?.action_proposals || []).filter((p) => p.proposal_id !== proposalId),
        assistant_text: response?.assistant_text || prev?.assistant_text,
      }));
      if (response?.job_id) {
        const poll = async () => {
          try {
            const job = await assistantPipelineService.getJobStatus(response.job_id);
            if (job?.status === "queued" || job?.status === "running") { setTimeout(poll, 2000); return; }
            setResult((prev) => ({ ...(prev || {}), assistant_text: job?.status === "succeeded" ? "Action complete." : (job?.error || "Action failed.") }));
          } catch (_) {}
        };
        setTimeout(poll, 1500);
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to confirm action.");
    } finally { setLoading(false); }
  }, [conversationId, pipelineEnabled]);

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
    }, 300);
  }, [onSwitchToVoice]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="text-panel"
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={switchingToVoice
          ? { opacity: 0, x: -20, filter: "blur(6px)" }
          : { scale: 0.88, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 364,
          zIndex: 9999,
          fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
          transformOrigin: "bottom right",
        }}
      >
        <div
          style={{
            background: "rgba(10,12,18,0.96)",
            backdropFilter: "blur(28px) saturate(1.8)",
            WebkitBackdropFilter: "blur(28px) saturate(1.8)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(129,140,248,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
            overflow: "hidden",
            maxHeight: "82vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── Top bar ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
            {/* Context chips */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 10px 3px 7px", borderRadius: 100,
                  background: `${ctx.color}14`, border: `1px solid ${ctx.color}30`,
                  fontSize: 11, fontWeight: 600, color: ctx.color, letterSpacing: "0.01em",
                }}>
                <span style={{ fontSize: 12 }}>{ctx.icon}</span>{ctx.label}
              </motion.div>
              {goalChip && (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 10px", borderRadius: 100,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.45)",
                  }}>
                  🎯 {goalChip}
                </motion.div>
              )}
            </div>
            <IconBtn onClick={handleClose} title="Close" danger>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </IconBtn>
          </div>

          {/* ── Scrollable content ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 4px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <TextOrb loading={loading} />
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.2, margin: 0, fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  AI Mentor
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0", lineHeight: 1 }}>
                  {pipelineEnabled ? "Powered by pipeline" : "Real-time coaching"}
                </p>
              </div>
            </div>

            {/* Input area */}
            <div style={{ marginBottom: 12 }}>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={4}
                disabled={loading}
                placeholder="What are you working on? Any blockers?"
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  resize: "none",
                  outline: "none",
                  fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(129,140,248,0.35)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; }}
              />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "right", marginTop: 5 }}>
                Ctrl+Enter to send
              </p>
            </div>

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              disabled={loading || !transcript.trim()}
              whileHover={(!loading && transcript.trim()) ? { scale: 1.02 } : {}}
              whileTap={(!loading && transcript.trim()) ? { scale: 0.98 } : {}}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 14,
                background: (!loading && transcript.trim())
                  ? "linear-gradient(135deg, #4338CA 0%, #818CF8 50%, #4338CA 100%)"
                  : "rgba(255,255,255,0.05)",
                border: "none",
                color: (!loading && transcript.trim()) ? "#fff" : "rgba(255,255,255,0.2)",
                fontSize: 14,
                fontWeight: 700,
                cursor: (!loading && transcript.trim()) ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                fontFamily: "inherit",
                letterSpacing: "0.01em",
                boxShadow: (!loading && transcript.trim()) ? "0 6px 22px rgba(67,56,202,0.35)" : "none",
                marginBottom: 16,
              }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.9s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Thinking…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Ask Mentor
                </>
              )}
            </motion.button>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)" }}>
                  <p style={{ fontSize: 12, color: "#F87171", margin: 0 }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ marginBottom: 12 }}
                >
                  {/* Tone badge */}
                  {!pipelineEnabled && result.emotional_tone && (() => {
                    const t = TONE[result.emotional_tone] || TONE.neutral;
                    return (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, background: t.bg, border: `1px solid ${t.border}`, fontSize: 11, fontWeight: 600, color: t.color, marginBottom: 10 }}>
                        {result.emotional_tone}
                      </div>
                    );
                  })()}

                  {/* Mentor message */}
                  <div style={{ padding: "13px 14px", borderRadius: 14, background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.18)", marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>Mentor</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
                      {pipelineEnabled ? result.assistant_text : result.mentor_message}
                    </p>
                  </div>

                  {/* Action proposals (pipeline) */}
                  {pipelineEnabled && Array.isArray(result.action_proposals) && result.action_proposals.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Confirm Actions</p>
                      {result.action_proposals.map((p) => (
                        <div key={p.proposal_id} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.18)", marginBottom: 6 }}>
                          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 8 }}>{p.summary}</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => handleProposalDecision(p.proposal_id, true)}
                              style={{ padding: "5px 14px", borderRadius: 8, background: "#059669", color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>Confirm</button>
                            <button onClick={() => handleProposalDecision(p.proposal_id, false)}
                              style={{ padding: "5px 14px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>Cancel</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action items (non-pipeline) */}
                  {!pipelineEnabled && result.action_items?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Action Items</p>
                      {result.action_items.map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                          style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#818CF8", flexShrink: 0, marginTop: 5 }} />
                          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.55, margin: 0 }}>{item}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <button onClick={() => setResult(null)}
                    style={{ width: "100%", padding: "10px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Ask another question
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Bottom mode toggle ── */}
          <div style={{ padding: "10px 16px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {/* Voice — switch */}
            <button onClick={handleSwitchToVoice}
              style={{ flex: 1, padding: "7px", borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "inherit" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
              Voice
            </button>
            {/* Text — active */}
            <div style={{ flex: 1, padding: "7px", borderRadius: 10, background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#818CF8", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Text
            </div>
          </div>
        </div>

        {/* Keyframe for spinner */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </AnimatePresence>
  );
}
