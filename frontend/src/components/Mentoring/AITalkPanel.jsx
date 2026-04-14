import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  ChevronDown,
  Mic,
  Minus,
  Plus,
  SlidersHorizontal,
  Sparkles,
  SquarePen,
} from "lucide-react";
import { mentoringService } from "../../api/mentoringService";
import { assistantPipelineService } from "../../api/assistantPipelineService";
import { getContextSourceFromPath, buildFrontendAssistantContext } from "../../utils/assistantContext";
import env from "../../config/env";

/* ─── Tone accent map ─────────────────────────────────────────────────────── */
const TONE = {
  encouraging: { color: "#34D399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.22)" },
  empathetic: { color: "#60A5FA", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.22)" },
  motivating: { color: "#FBBF24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.22)" },
  neutral: { color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.18)" },
  supportive: { color: "#A78BFA", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.22)" },
  challenging: { color: "#FB7185", bg: "rgba(251,113,133,0.1)", border: "rgba(251,113,133,0.22)" },
  celebratory: { color: "#F472B6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.22)" },
};

/* ─── Context meta (same as AIVoicePanel) ────────────────────────────────── */
const CTX = {
  roadmap: { icon: "🗺️", label: "Roadmap", color: "#818CF8" },
  dashboard: { icon: "⚡", label: "Dashboard", color: "#FBBF24" },
  tasks: { icon: "✅", label: "Tasks", color: "#34D399" },
  resume: { icon: "📄", label: "Resume", color: "#60A5FA" },
  ats: { icon: "🎯", label: "ATS Scan", color: "#F472B6" },
  interview: { icon: "🎤", label: "Interview", color: "#A78BFA" },
  portfolio: { icon: "🌐", label: "Portfolio", color: "#2DD4BF" },
  projects: { icon: "⚙️", label: "Projects", color: "#FB923C" },
  planora: { icon: "📚", label: "Planora", color: "#22D3EE" },
  scheduler: { icon: "📅", label: "Scheduler", color: "#86EFAC" },
  general: { icon: "🤖", label: "General", color: "#94A3B8" },
};

const STARTER_ACTIONS = {
  dashboard: [
    { icon: "⚡", label: "What should I focus on today?" },
    { icon: "📈", label: "Analyze my progress" },
    { icon: "✅", label: "Create a task tracker" },
  ],
  roadmap: [
    { icon: "🧭", label: "What should I study next?" },
    { icon: "📚", label: "Break my roadmap into weekly goals" },
    { icon: "🛠", label: "Find gaps in my learning plan" },
  ],
  tasks: [
    { icon: "🎯", label: "What should I prioritize first?" },
    { icon: "🧩", label: "Turn these tasks into a focused sprint" },
    { icon: "⏱", label: "Estimate effort for today" },
  ],
  resume: [
    { icon: "📄", label: "Improve my resume summary" },
    { icon: "🧠", label: "Rewrite bullet points for impact" },
    { icon: "🏁", label: "Optimize for ATS keywords" },
  ],
  interview: [
    { icon: "🎤", label: "Practice common interview questions" },
    { icon: "💬", label: "Run a behavioral mock interview" },
    { icon: "📝", label: "Give feedback on my answers" },
  ],
  portfolio: [
    { icon: "🌐", label: "Review my portfolio structure" },
    { icon: "✨", label: "Suggest project story improvements" },
    { icon: "📣", label: "Strengthen my personal brand message" },
  ],
  projects: [
    { icon: "🛠", label: "Suggest improvements for this project" },
    { icon: "📦", label: "Help define the next milestone" },
    { icon: "🚀", label: "How can I level this up?" },
  ],
  planora: [
    { icon: "🗺", label: "Plan my next week clearly" },
    { icon: "📌", label: "Summarize my top priorities" },
    { icon: "🔍", label: "Find hidden blockers" },
  ],
  scheduler: [
    { icon: "📅", label: "Help me design a realistic week" },
    { icon: "🔁", label: "Balance deep work and revision" },
    { icon: "🧘", label: "Add healthy recovery slots" },
  ],
  general: [
    { icon: "🧠", label: "How can I work smarter this week?" },
    { icon: "🔎", label: "Analyze where I am stuck" },
    { icon: "✅", label: "Create a task tracker" },
  ],
};

/* ─── Icon button ─────────────────────────────────────────────────────────── */
function IconBtn({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36, height: 36, borderRadius: 11,
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.5)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", outline: "none",
      }}
    >
      {children}
    </button>
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

  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [switchingToVoice, setSwitchingToVoice] = useState(false);
  const CONV_KEY = `planorah_conv_${contextSource}`;
  const [conversationId, setConversationId] = useState(() => localStorage.getItem(CONV_KEY));

  const [userCtx, setUserCtx] = useState(null);

  useEffect(() => {
    let cancelled = false;
    assistantPipelineService.getUserContext()
      .then((data) => { if (!cancelled) setUserCtx(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const pipelineEnabled = env.AI_PIPELINE_ENABLED && env.AI_PIPELINE_CHANNELS.includes("text");
  const ctx = CTX[contextSource] || CTX.general;
  const goalChip = studentGoal ? studentGoal.slice(0, 32) + (studentGoal.length > 32 ? "…" : "") : null;
  const quickActions = STARTER_ACTIONS[contextSource] || STARTER_ACTIONS.general;

  const handleSubmit = async (overrideText = null) => {
    const message = (overrideText || transcript).trim();
    if (!message || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      if (pipelineEnabled) {
        const pathname = typeof window !== "undefined" ? window.location.pathname : "/dashboard";
        const data = await assistantPipelineService.sendTextTurn({
          message,
          contextSource,
          frontendContext: buildFrontendAssistantContext({ pathname, visiblePanel: "ai_talk_panel", metadata: { student_goal: studentGoal, current_progress: currentProgress } }),
          conversationId,
          languagePreference: "hinglish",
        });
        if (data?.conversation_id) {
          setConversationId(data.conversation_id);
          localStorage.setItem(CONV_KEY, data.conversation_id);
        }
        setResult(data);
      } else {
        const data = await mentoringService.createSession({
          context_source: contextSource,
          student_goal: studentGoal,
          current_progress: currentProgress,
          transcript: message,
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
          } catch (_) { }
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
    setError("");
    setConversationId(null);
    onClose?.();
  }, [onClose]);

  const handleNewChat = useCallback(() => {
    setResult(null);
    setTranscript("");
    setError("");
    setConversationId(null);
    localStorage.removeItem(CONV_KEY);
  }, [CONV_KEY]);

  const handleQuickAction = useCallback((actionLabel) => {
    handleSubmit(actionLabel);
  }, [handleSubmit]);

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
        initial={{ scale: 0.92, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={switchingToVoice
          ? { opacity: 0, x: -20, filter: "blur(4px)" }
          : { scale: 0.92, opacity: 0, y: 14 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        style={{
          position: "fixed",
          bottom: 14,
          left: 12,
          right: 12,
          maxWidth: 398,
          width: "calc(100vw - 24px)",
          marginLeft: "auto",
          zIndex: 9999,
          fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
          transformOrigin: "bottom right",
        }}
      >
        <div
          style={{
            background: "linear-gradient(180deg, rgba(15,16,20,0.99) 0%, rgba(10,11,14,0.99) 100%)",
            backdropFilter: "blur(18px) saturate(1.2)",
            WebkitBackdropFilter: "blur(18px) saturate(1.2)",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
            maxHeight: "min(86vh, 760px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}>
            <button
              onClick={handleNewChat}
              style={{
                border: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.9)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
              }}
              title="Start a new chat"
            >
              <SquarePen size={14} strokeWidth={2.2} />
              <span>New AI chat</span>
              <ChevronDown size={15} strokeWidth={2.2} color="rgba(255,255,255,0.55)" />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconBtn onClick={handleClose} title="Minimize">
                <Minus size={14} strokeWidth={2.6} />
              </IconBtn>
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 10px" }}>
            {!result && !loading && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column' }}>
                {userCtx && (userCtx.target_role || userCtx.goal) && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '5px 12px 5px 8px',
                    borderRadius: 100,
                    background: 'rgba(45,212,191,0.07)',
                    border: '1px solid rgba(45,212,191,0.15)',
                    marginBottom: 18,
                    alignSelf: 'flex-start',
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#2DD4BF', flexShrink: 0,
                      boxShadow: '0 0 6px rgba(45,212,191,0.7)',
                    }} />
                    {userCtx.target_role && (
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                        {userCtx.target_role}
                      </span>
                    )}
                    {userCtx.tasks_total > 0 && (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                        · {userCtx.progress_pct}%
                      </span>
                    )}
                  </div>
                )}
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Sparkles size={22} strokeWidth={2.3} color="rgba(255,255,255,0.9)" />
                </div>
                <h3 style={{ margin: 0, fontSize: 34, lineHeight: 1.05, color: "rgba(255,255,255,0.94)", fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 500 }}>
                  How can I
                  <br />
                  help you?
                </h3>
                <div style={{ marginTop: 20, display: "grid", gap: 9 }}>
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.label)}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 12,
                        color: 'rgba(255,255,255,0.82)',
                        textAlign: 'left',
                        fontSize: 14,
                        lineHeight: 1.35,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        width: '100%',
                        fontFamily: 'inherit',
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                      }}
                    >
                      <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{action.icon}</span>
                      <span style={{ flex: 1 }}>{action.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 14 }}>
                <div style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={14} color="rgba(255,255,255,0.7)" />
                  </motion.div>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>Thinking...</span>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.24)" }}>
                  <p style={{ fontSize: 12, color: "#F87171", margin: 0 }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ marginBottom: 12 }}
                >
                  {!pipelineEnabled && result.emotional_tone && (() => {
                    const t = TONE[result.emotional_tone] || TONE.neutral;
                    return (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, background: t.bg, border: `1px solid ${t.border}`, fontSize: 11, fontWeight: 600, color: t.color, marginBottom: 10 }}>
                        {result.emotional_tone}
                      </div>
                    );
                  })()}

                  <div style={{ padding: "14px 14px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.48)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
                      Mentor
                    </p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
                      {pipelineEnabled ? result.assistant_text : result.mentor_message}
                    </p>
                  </div>

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

                  <button
                    onClick={handleNewChat}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.58)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Start a new quest
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Composer */}
          <div style={{ padding: "10px 12px 12px", flexShrink: 0 }}>
            <div style={{
              borderRadius: 18,
              border: "1px solid rgba(45,212,191,0.3)",
              background: "rgba(35,36,40,0.92)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              padding: "10px 10px 8px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                }}>
                  <Sparkles size={11} strokeWidth={2.3} />
                  Planorah
                </span>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 9px",
                  borderRadius: 999,
                  background: `${ctx.color}18`,
                  border: `1px solid ${ctx.color}35`,
                  color: ctx.color,
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  <span>{ctx.icon}</span>
                  {ctx.label}
                </span>
              </div>

              {goalChip && (
                <p style={{ margin: "8px 2px 0", fontSize: 11, color: "rgba(255,255,255,0.44)" }}>
                  Goal: {goalChip}
                </p>
              )}

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={loading}
                placeholder="Do anything with AI..."
                style={{
                  width: "100%",
                  marginTop: 8,
                  border: "none",
                  background: "transparent",
                  color: "rgba(255,255,255,0.86)",
                  fontSize: 22,
                  lineHeight: 1.3,
                  resize: "none",
                  outline: "none",
                  fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                }}
              />

              <div style={{
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <IconBtn onClick={() => { }} title="Attach or add">
                    <Plus size={14} strokeWidth={2.6} />
                  </IconBtn>
                  <IconBtn onClick={() => { }} title="Tuning">
                    <SlidersHorizontal size={14} strokeWidth={2.2} />
                  </IconBtn>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {onSwitchToVoice && (
                    <button
                      onClick={handleSwitchToVoice}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                      title="Switch to voice"
                    >
                      <Mic size={16} strokeWidth={2.2} />
                    </button>
                  )}
                  <button
                    onClick={() => handleSubmit()}
                    disabled={loading || !transcript.trim()}
                    title="Send"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: "none",
                      background: (loading || !transcript.trim()) ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.86)",
                      color: "#111",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: (loading || !transcript.trim()) ? "not-allowed" : "pointer",
                    }}
                  >
                    <ArrowUp size={13} strokeWidth={2.8} />
                  </button>
                </div>
              </div>

              <p style={{ margin: "6px 2px 0", fontSize: 10, color: "rgba(255,255,255,0.24)", textAlign: "right" }}>
                Ctrl+Enter to send
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
