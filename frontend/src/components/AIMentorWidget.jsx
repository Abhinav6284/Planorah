import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mentoringService } from '../api/mentoringService';

/* ── Page context from URL + section-specific actions ──────────────────────── */
const SECTION_CONTEXTS = {
  lab: { label: 'Virtual Lab', icon: '🔬', source: 'lab', section: 'LEARN' },
  roadmap: { label: 'Learning Path', icon: '🗺️', source: 'roadmap', section: 'LEARN' },
  projects: { label: 'My Projects', icon: '⚙️', source: 'projects', section: 'LEARN' },
  planora: { label: 'Study Platform', icon: '📚', source: 'planora', section: 'LEARN' },
  resume: { label: 'Resume Builder', icon: '📄', source: 'resume', section: 'CAREER' },
  ats: { label: 'Compiled Resumes', icon: '📋', source: 'ats', section: 'CAREER' },
  jobs: { label: 'Find Your Fit', icon: '🎯', source: 'jobs', section: 'CAREER' },
  portfolio: { label: 'Job Finder', icon: '💼', source: 'portfolio', section: 'CAREER' },
  interview: { label: 'Mock Interview', icon: '🎤', source: 'interview', section: 'CAREER' },
  tasks: { label: 'Task Management', icon: '✅', source: 'tasks', section: 'LEARN' },
  scheduler: { label: 'Scheduler', icon: '📅', source: 'scheduler', section: 'LEARN' },
  dashboard: { label: 'Dashboard', icon: '⚡', source: 'dashboard', section: 'LEARN' },
};

const QUICK_ACTIONS_BY_SOURCE = {
  lab: [
    { emoji: '🔬', label: 'Help me set up this experiment' },
    { emoji: '💡', label: 'Explain the concept' },
    { emoji: '🚀', label: 'What should I try next?' },
  ],
  roadmap: [
    { emoji: '🗺️', label: 'Guide me through my learning path' },
    { emoji: '📊', label: 'Show my progress' },
    { emoji: '⏭️', label: 'What should I study next?' },
  ],
  projects: [
    { emoji: '⚙️', label: 'Help me plan this project' },
    { emoji: '🎯', label: 'Suggest improvements' },
    { emoji: '📈', label: 'How can I level up?' },
  ],
  planora: [
    { emoji: '📚', label: 'Create a study plan' },
    { emoji: '❓', label: 'Explain this topic' },
    { emoji: '✨', label: 'Quiz me on this' },
  ],
  resume: [
    { emoji: '📝', label: 'Improve my resume content' },
    { emoji: '✍️', label: 'Make it more impactful' },
    { emoji: '🎯', label: 'ATS optimization tips' },
  ],
  ats: [
    { emoji: '📋', label: 'Score my resume' },
    { emoji: '🔍', label: 'Check for ATS compatibility' },
    { emoji: '💪', label: 'Strengthen weak areas' },
  ],
  jobs: [
    { emoji: '🎯', label: 'Find roles matching my skills' },
    { emoji: '📍', label: 'Best companies in my field' },
    { emoji: '💼', label: 'Career path recommendations' },
  ],
  portfolio: [
    { emoji: '💼', label: 'Best job opportunities for me' },
    { emoji: '🎓', label: 'Salary insights by role' },
    { emoji: '🚀', label: 'How to stand out?' },
  ],
  interview: [
    { emoji: '🎤', label: 'Practice common questions' },
    { emoji: '💬', label: 'Behavioral interview tips' },
    { emoji: '🧠', label: 'Technical prep help' },
  ],
  tasks: [
    { emoji: '✅', label: 'Prioritize my tasks' },
    { emoji: '⏰', label: 'Plan my day' },
    { emoji: '🎯', label: 'What should I do first?' },
  ],
  scheduler: [
    { emoji: '📅', label: 'Optimize my schedule' },
    { emoji: '⏱️', label: 'Time management tips' },
    { emoji: '🎯', label: 'Build better habits' },
  ],
  dashboard: [
    { emoji: '⚡', label: 'What should I focus on today?' },
    { emoji: '📊', label: 'Analyze my progress' },
    { emoji: '🎯', label: 'Productivity insights' },
  ],
};

const getPageContext = () => {
  const p = window.location.pathname;

  for (const [key, context] of Object.entries(SECTION_CONTEXTS)) {
    if (p.startsWith(`/${key}`)) return context;
  }

  return { label: 'General', icon: '✨', source: 'general', section: 'GENERAL' };
};

const getQuickActions = (source) => QUICK_ACTIONS_BY_SOURCE[source] || QUICK_ACTIONS_BY_SOURCE.dashboard;

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/* ── Animated thinking dots ────────────────────────────────────────────────── */
function ThinkingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 0 2px' }}>
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          style={{
            display: 'inline-block', width: 7, height: 7,
            borderRadius: '50%', background: 'rgba(255,255,255,0.4)',
          }}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ── Streaming text with blinking cursor ───────────────────────────────────── */
function StreamingText({ fullText, speed = 11, onComplete }) {
  const [shown, setShown] = useState('');
  const [done, setDone]   = useState(false);

  useEffect(() => {
    setShown('');
    setDone(false);
    let idx = 0;
    const t = setInterval(() => {
      idx++;
      setShown(fullText.slice(0, idx));
      if (idx >= fullText.length) { clearInterval(t); setDone(true); onComplete?.(); }
    }, speed);
    return () => clearInterval(t);
  }, [fullText, speed, onComplete]);

  return (
    <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
      {shown}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, ease: 'linear' }}
          style={{
            display: 'inline-block', width: 2, height: '0.88em',
            background: 'rgba(255,255,255,0.7)', marginLeft: 2,
            verticalAlign: 'text-bottom', borderRadius: 1,
          }}
        />
      )}
    </span>
  );
}

/* ── Global styles (injected once) ────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  .naim-root *, .naim-root *::before, .naim-root *::after { box-sizing: border-box; }
  .naim-root { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

  .naim-textarea {
    background: transparent; border: none; outline: none; resize: none;
    color: rgba(255,255,255,0.87); font-size: 13.5px; line-height: 1.55;
    font-family: 'DM Sans', -apple-system, sans-serif; width: 100%;
  }
  .naim-textarea::placeholder { color: rgba(255,255,255,0.27); }
  .naim-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

  .naim-quick-btn {
    background: transparent; border: none; cursor: pointer;
    display: flex; align-items: center; gap: 10px;
    padding: 7px 10px; border-radius: 6px; text-align: left;
    transition: background 0.1s ease; width: 100%;
  }
  .naim-quick-btn:hover { background: rgba(255,255,255,0.055); }

  .naim-icon-btn {
    background: transparent; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 6px;
    transition: background 0.12s ease; flex-shrink: 0;
  }
  .naim-icon-btn:hover { background: rgba(255,255,255,0.08); }

  .naim-scrollbar::-webkit-scrollbar { width: 3px; }
  .naim-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .naim-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  @keyframes naim-spin { to { transform: rotate(360deg); } }
  @keyframes naim-fadein { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

/* ── Main component ─────────────────────────────────────────────────────────  */
export default function AIMentorWidget() {
  injectStyles();

  const [open,        setOpen]        = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [inputFocused,setInputFocused]= useState(false);
  const [error,       setError]       = useState('');

  const context     = getPageContext();
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const hasMessages = messages.length > 0;

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* focus textarea when panel opens */
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 280);
  }, [open]);

  /* send message → API */
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    const aiId = uid();

    setMessages(prev => [...prev, { id: uid(), role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const data = await mentoringService.createSession({
        context_source: context.source,
        transcript:     text.trim(),
        student_goal:   '',
        current_progress: '',
      });

      const base       = data.mentor_message || "I'm here to help! Could you tell me more?";
      const items      = Array.isArray(data.action_items) ? data.action_items : [];
      const fullText   = items.length
        ? `${base}\n\n${items.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
        : base;

      setLoading(false);
      setMessages(prev => [...prev, { id: aiId, role: 'ai', content: fullText, streaming: true }]);
      setStreamingId(aiId);
    } catch {
      setLoading(false);
      setError('Something went wrong. Please try again.');
    }
  }, [loading, context.source]);

  const handleSubmit    = () => { if (input.trim() && !loading) sendMessage(input); };
  const handleKeyDown   = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };
  const handleQuickAction = (label) => sendMessage(label);
  const handleStreamDone  = (id) => {
    setStreamingId(null);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, streaming: false } : m));
  };
  const clearChat = () => { setMessages([]); setStreamingId(null); setError(''); };

  /* ── Render ── */
  return (
    <div className="naim-root" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="naim-panel"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28, mass: 0.6, duration: 0.4 }}
            style={{
              position: 'absolute', bottom: 58, right: 0,
              width: 400, maxHeight: 530,
              background: '#191919',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 72px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >

            {/* ── Header ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}>
              <button
                className="naim-icon-btn"
                onClick={clearChat}
                title="New chat"
                style={{ padding: '4px 8px', width: 'auto', gap: 5, color: 'rgba(255,255,255,0.72)', fontSize: 13.5, fontWeight: 500, borderRadius: 7 }}
              >
                New AI chat
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Edit */}
                <button className="naim-icon-btn" title="Edit" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                {/* Expand */}
                <button className="naim-icon-btn" title="Expand" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>
                {/* Minimise */}
                <button
                  className="naim-icon-btn"
                  onClick={() => setOpen(false)}
                  title="Minimise"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Content ── */}
            <div
              className="naim-scrollbar"
              style={{
                flex: 1, overflowY: 'auto',
                padding: hasMessages ? '14px 16px 6px' : '0',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Welcome state */}
              {!hasMessages && (
                <div style={{ padding: '28px 18px 18px', display: 'flex', flexDirection: 'column' }}>
                  {/* Avatar orb */}
                  <div style={{
                    width: 46, height: 46, borderRadius: 10, marginBottom: 16, flexShrink: 0,
                    background: 'linear-gradient(135deg, #1a6ef5 0%, #4fa3ff 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, boxShadow: '0 6px 24px rgba(26,110,245,0.35)',
                  }}>
                    ✨
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                      {context.section} • {context.icon} {context.label}
                    </div>
                    <h2 style={{
                      color: 'rgba(255,255,255,0.92)', fontSize: 17.5, fontWeight: 600,
                      margin: '0 0 14px', letterSpacing: '-0.015em', lineHeight: 1.3,
                    }}>
                      How can I help?
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {getQuickActions(context.source).map((action, idx) => (
                      <motion.button
                        key={action.label}
                        className="naim-quick-btn"
                        onClick={() => handleQuickAction(action.label)}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.055, ease: 'easeOut' }}
                        whileHover={{ x: 4 }}
                      >
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{action.emoji}</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13.5, fontWeight: 400 }}>
                          {action.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {hasMessages && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut', type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      {msg.role === 'user' ? (
                        /* User bubble */
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <div style={{
                            background: 'rgba(255,255,255,0.09)',
                            borderRadius: '10px 10px 2px 10px',
                            padding: '9px 13px',
                            maxWidth: '82%',
                            fontSize: 13.5,
                            color: 'rgba(255,255,255,0.88)',
                            lineHeight: 1.55,
                          }}>
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        /* AI bubble */
                        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: 5, flexShrink: 0, marginTop: 1,
                            background: 'linear-gradient(135deg, #1a6ef5 0%, #4fa3ff 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11,
                          }}>
                            ✨
                          </div>
                          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.78)', flex: 1 }}>
                            {msg.streaming && streamingId === msg.id ? (
                              <StreamingText
                                fullText={msg.content}
                                onComplete={() => handleStreamDone(msg.id)}
                              />
                            ) : (
                              <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{msg.content}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Thinking indicator */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 5, flexShrink: 0, marginTop: 1,
                        background: 'linear-gradient(135deg, #1a6ef5 0%, #4fa3ff 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11,
                      }}>
                        ✨
                      </div>
                      <ThinkingDots />
                    </motion.div>
                  )}

                  {/* Error */}
                  {error && (
                    <div style={{
                      fontSize: 12.5, color: '#f87171', padding: '7px 10px',
                      borderRadius: 7, background: 'rgba(248,113,113,0.1)',
                    }}>
                      {error}
                    </div>
                  )}

                  <div ref={bottomRef} style={{ height: 4 }} />
                </div>
              )}
            </div>

            {/* ── Input bar ── */}
            <div style={{ padding: '8px 12px 12px', flexShrink: 0 }}>
              <div style={{
                background: '#272727',
                borderRadius: 10,
                border: `1.5px solid ${inputFocused ? '#2383e2' : 'rgba(255,255,255,0.09)'}`,
                padding: '10px 12px 8px',
                transition: 'border-color 0.14s ease',
              }}>
                {/* Context chip */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 7 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 5, padding: '2px 8px 2px 6px',
                    fontSize: 11.5, color: 'rgba(255,255,255,0.45)',
                    userSelect: 'none',
                  }}>
                    <span style={{ fontSize: 12 }}>{context.icon}</span>
                    <span>{context.label}</span>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  className="naim-textarea"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Do anything with AI..."
                  rows={2}
                  disabled={loading}
                  style={{ maxHeight: 90 }}
                />

                {/* Button row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 3 }}>
                  {/* + attach */}
                  <button className="naim-icon-btn" title="Attach" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  {/* Tune */}
                  <button className="naim-icon-btn" title="Options" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                      <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                      <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
                      <line x1="17" y1="16" x2="23" y2="16" />
                    </svg>
                  </button>
                  {/* Auto label */}
                  <span style={{
                    fontSize: 11.5, color: 'rgba(255,255,255,0.28)',
                    marginLeft: 3, userSelect: 'none', letterSpacing: '0.01em',
                  }}>
                    Auto
                  </span>

                  <div style={{ flex: 1 }} />

                  {/* Mic */}
                  <button className="naim-icon-btn" title="Voice" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8"  y1="23" x2="16" y2="23" />
                    </svg>
                  </button>

                  {/* Send */}
                  <motion.button
                    whileHover={!loading && input.trim() ? { scale: 1.1 } : {}}
                    whileTap={!loading  && input.trim() ? { scale: 0.9 } : {}}
                    onClick={handleSubmit}
                    disabled={!input.trim() || loading}
                    style={{
                      width: 28, height: 28, borderRadius: 7, border: 'none',
                      background: (!input.trim() || loading) ? 'rgba(255,255,255,0.09)' : '#ffffff',
                      cursor: (!input.trim() || loading) ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: (!input.trim() || loading) ? 'rgba(255,255,255,0.2)' : '#191919',
                      transition: 'background 0.15s, color 0.15s',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        style={{
          width: 46, height: 46, borderRadius: '50%', border: 'none',
          background: '#191919',
          boxShadow: open
            ? '0 0 0 2px rgba(35,131,226,0.5), 0 12px 32px rgba(0,0,0,0.55)'
            : '0 4px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.1)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          transition: 'all 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Spinning conic highlight */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(35,131,226,0.55) 110deg, rgba(91,164,255,0.65) 180deg, transparent 250deg)',
          animation: 'naim-spin 3s linear infinite',
        }} />
        {/* Inner glass */}
        <div style={{
          position: 'absolute', inset: '2px', borderRadius: '50%',
          background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.18) 0%, transparent 55%)',
          mixBlendMode: 'overlay',
        }} />
        {/* Icon */}
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20, mass: 0.8, duration: 0.4 }}
          style={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.9)' }}
        >
          {open ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
