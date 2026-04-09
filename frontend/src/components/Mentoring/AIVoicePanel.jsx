import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mentoringService } from "../../api/mentoringService";
import { assistantPipelineService } from "../../api/assistantPipelineService";
import { getContextSourceFromPath } from "../../utils/assistantContext";
import env from "../../config/env";
import { useVoiceSession } from "../../hooks/useVoiceSession";
import { useVoicePipelineSession } from "../../hooks/useVoicePipelineSession";

/* ─── Font injection ──────────────────────────────────────────────────────── */
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,500;12..96,700&family=Instrument+Serif:ital@0;1&display=swap";

function injectFont() {
  if (document.getElementById("planorah-voice-fonts")) return;
  const l = document.createElement("link");
  l.id = "planorah-voice-fonts";
  l.rel = "stylesheet";
  l.href = FONT_URL;
  document.head.appendChild(l);
}

/* ─── Context meta ────────────────────────────────────────────────────────── */
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

/* ─── Liquid-metal orb ───────────────────────────────────────────────────── */
function Orb({ size = 108, audioLevel = 0, isSpeaking = false, isActive = false, status = "idle" }) {
  const glow = isActive ? 0.35 + audioLevel * 0.35 : 0.12;
  const isConnecting = status === "connecting";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Ambient glow rings */}
      <AnimatePresence>
        {(isActive || isConnecting) &&
          [0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.2 + i * 0.5, opacity: 0 }}
              transition={{
                duration: 2.2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.65,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: isSpeaking
                  ? "rgba(251,191,36,0.18)"
                  : "rgba(45,212,191,0.18)",
                transformOrigin: "center",
              }}
            />
          ))}
      </AnimatePresence>

      {/* Sphere */}
      <motion.div
        animate={{
          scale: isActive ? 1 + audioLevel * 0.12 : isConnecting ? [1, 1.04, 1] : 1,
          filter: `brightness(${isActive ? 1 + audioLevel * 0.25 : 1})`,
        }}
        transition={
          isConnecting
            ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 280, damping: 22 }
        }
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 40% 33%, #A7F3D0 0%, #2DD4BF 18%, #0D9488 50%, #042F2E 80%, #010B0B 100%)",
          boxShadow: `
            inset 0 -8px 24px rgba(0,0,0,0.65),
            inset 0 8px 20px rgba(167,243,208,0.22),
            0 0 ${Math.round(size * glow * 2.2)}px rgba(45,212,191,${glow.toFixed(2)}),
            0 ${Math.round(size * 0.18)}px ${Math.round(size * 0.55)}px rgba(0,0,0,0.55)
          `,
          overflow: "hidden",
        }}
      >
        {/* Rotating iridescent shimmer */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: isActive ? 3 : 6, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(167,243,208,0.55) 55deg, rgba(56,189,248,0.65) 110deg, rgba(45,212,191,0.45) 170deg, transparent 220deg, transparent 360deg)",
            mixBlendMode: "overlay",
          }}
        />
        {/* Specular highlight — top-left */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 30% 26%, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.12) 38%, transparent 55%)",
            mixBlendMode: "overlay",
          }}
        />
        {/* Diffuse warm rim — bottom-right */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 72% 78%, rgba(45,212,191,0.4) 0%, transparent 58%)",
            mixBlendMode: "screen",
          }}
        />
        {/* Speaking amber tint */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.28) 0%, transparent 70%)",
                mixBlendMode: "screen",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ─── Mini-pill (collapsed state) ───────────────────────────────────────── */
function MiniPill({ isActive, isSpeaking, audioLevel, sessionDuration, formatTime, onExpand, onEnd }) {
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.7, opacity: 0, y: 12 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}
    >
      <button
        onClick={onExpand}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 44,
          paddingLeft: 8,
          paddingRight: isActive ? 6 : 14,
          borderRadius: 100,
          background: "rgba(12,14,20,0.85)",
          backdropFilter: "blur(20px) saturate(1.8)",
          WebkitBackdropFilter: "blur(20px) saturate(1.8)",
          border: "1px solid rgba(45,212,191,0.18)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <Orb size={28} isActive={isActive} isSpeaking={isSpeaking} audioLevel={audioLevel} />

        {!isActive ? (
          <span
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              color: "rgba(255,255,255,0.88)",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            Voice chat
          </span>
        ) : (
          <span
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.02em",
              minWidth: 42,
              textAlign: "center",
            }}
          >
            {formatTime(sessionDuration)}
          </span>
        )}

        {isActive ? (
          <button
            onClick={(e) => { e.stopPropagation(); onEnd(); }}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#F87171",
              outline: "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        )}
      </button>
    </motion.div>
  );
}

/* ─── Expanded panel ─────────────────────────────────────────────────────── */
function ExpandedPanel({
  status, isSpeaking, audioLevel, sessionDuration, formatTime,
  contextSource, studentGoal,
  voiceConfig, selectedVoice, setSelectedVoice,
  transcript, error,
  pipelineEnabled, isCapturing,
  latestResult, actionProposals, confirmProposal,
  startTurn, stopTurn,
  onMinimize, onClose, onStart, onEnd, onSwitchToText,
}) {
  const ctx = CTX[contextSource] || CTX.general;
  const isIdle = status === "idle";
  const isActive = status === "active";
  const isConnecting = status === "connecting";

  const statusLabel = isConnecting
    ? "Connecting…"
    : isActive
    ? isSpeaking
      ? "Speaking"
      : pipelineEnabled
      ? isCapturing ? "Recording…" : "Ready to speak"
      : "Listening…"
    : "Ready to start";

  const statusDot = isConnecting ? "#FBBF24" : isActive ? "#34D399" : "rgba(255,255,255,0.25)";

  /* Page-derived extra chips (if goal is set) */
  const goalChip = studentGoal ? studentGoal.slice(0, 32) + (studentGoal.length > 32 ? "…" : "") : null;

  return (
    <motion.div
      key="expanded"
      initial={{ scale: 0.88, opacity: 0, y: 24, originX: 1, originY: 1 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.88, opacity: 0, y: 24 }}
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
      {/* Card */}
      <div
        style={{
          background: "rgba(10,12,18,0.96)",
          backdropFilter: "blur(28px) saturate(1.8)",
          WebkitBackdropFilter: "blur(28px) saturate(1.8)",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(45,212,191,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
          overflow: "hidden",
        }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Context chips */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px 3px 7px",
                borderRadius: 100,
                background: `${ctx.color}14`,
                border: `1px solid ${ctx.color}30`,
                fontSize: 11,
                fontWeight: 600,
                color: ctx.color,
                letterSpacing: "0.01em",
              }}
            >
              <span style={{ fontSize: 12 }}>{ctx.icon}</span>
              {ctx.label}
            </motion.div>
            {goalChip && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.14 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 10px",
                  borderRadius: 100,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                🎯 {goalChip}
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <IconBtn onClick={onMinimize} title="Minimise">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="10" y1="14" x2="3" y2="21" />
                <line x1="21" y1="3" x2="14" y2="10" />
              </svg>
            </IconBtn>
            <IconBtn onClick={onClose} title="Close" danger>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </IconBtn>
          </div>
        </div>

        {/* ── Orb section ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            padding: "28px 20px 20px",
          }}
        >
          <Orb size={108} isActive={isActive} isSpeaking={isSpeaking} audioLevel={audioLevel} status={status} />

          {/* Status + timer */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: isActive ? 1.4 : 3, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: statusDot }}
              />
              <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: "0.01em" }}>
                {statusLabel}
              </span>
            </div>
            {isActive && (
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                  letterSpacing: "0.04em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatTime(sessionDuration)}
              </span>
            )}
          </div>
        </div>

        {/* ── Live transcript ── */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  margin: "0 16px 12px",
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  maxHeight: 80,
                  overflowY: "auto",
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(45,212,191,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
                  Live
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.5, margin: 0 }}>{transcript}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Latest pipeline response ── */}
        <AnimatePresence>
          {pipelineEnabled && latestResult?.assistant_text && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  margin: "0 16px 12px",
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "rgba(129,140,248,0.08)",
                  border: "1px solid rgba(129,140,248,0.18)",
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 600, color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
                  Mentor
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.5, margin: 0 }}>{latestResult.assistant_text}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action proposals ── */}
        <AnimatePresence>
          {pipelineEnabled && Array.isArray(actionProposals) && actionProposals.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div style={{ margin: "0 16px 12px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Confirm Actions
                </p>
                {actionProposals.map((p) => (
                  <div key={p.proposal_id} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.18)", marginBottom: 6 }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 8 }}>{p.summary}</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => confirmProposal(p.proposal_id, true)}
                        style={{ padding: "5px 14px", borderRadius: 8, background: "#059669", color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>
                        Confirm
                      </button>
                      <button onClick={() => confirmProposal(p.proposal_id, false)}
                        style={{ padding: "5px 14px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Push-to-talk ── */}
        {pipelineEnabled && isActive && (
          <div style={{ padding: "0 16px 12px" }}>
            <button
              onMouseDown={startTurn}
              onMouseUp={stopTurn}
              onMouseLeave={() => { if (isCapturing) stopTurn(); }}
              onTouchStart={startTurn}
              onTouchEnd={stopTurn}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 14,
                background: isCapturing ? "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${isCapturing ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: isCapturing ? "#34D399" : "rgba(255,255,255,0.55)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "inherit",
                letterSpacing: "0.01em",
              }}
            >
              {isCapturing ? "Release to send" : "Hold to speak"}
            </button>
          </div>
        )}

        {/* ── Voice selection ── */}
        {voiceConfig?.available_voices?.length > 0 && (
          <div style={{ padding: "0 16px 12px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Voice
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {voiceConfig.available_voices.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 100,
                    background: selectedVoice === v.id ? "rgba(45,212,191,0.18)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${selectedVoice === v.id ? "rgba(45,212,191,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: selectedVoice === v.id ? "#2DD4BF" : "rgba(255,255,255,0.45)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{ margin: "0 16px 12px", padding: "10px 14px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)" }}>
            <p style={{ fontSize: 12, color: "#F87171", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Primary action ── */}
        <div style={{ padding: "4px 16px 16px" }}>
          {isIdle && (
            <motion.button
              onClick={onStart}
              disabled={!voiceConfig}
              whileHover={voiceConfig ? { scale: 1.02 } : {}}
              whileTap={voiceConfig ? { scale: 0.98 } : {}}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 16,
                background: voiceConfig
                  ? "linear-gradient(135deg, #0D9488 0%, #2DD4BF 50%, #0D9488 100%)"
                  : "rgba(255,255,255,0.06)",
                border: "none",
                color: voiceConfig ? "#000D0B" : "rgba(255,255,255,0.25)",
                fontSize: 14,
                fontWeight: 700,
                cursor: voiceConfig ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                fontFamily: "inherit",
                letterSpacing: "0.01em",
                boxShadow: voiceConfig ? "0 8px 28px rgba(13,148,136,0.35)" : "none",
              }}
            >
              {!voiceConfig ? (
                <>
                  <SpinIcon />
                  Initialising…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Start Conversation
                </>
              )}
            </motion.button>
          )}

          {!isIdle && (
            <motion.button
              onClick={onEnd}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 16,
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#F87171",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                fontFamily: "inherit",
                letterSpacing: "0.01em",
              }}
            >
              {isConnecting ? "Cancel" : "End Session"}
            </motion.button>
          )}
        </div>

        {/* ── Bottom mode toggle ── */}
        <div
          style={{
            padding: "10px 16px 14px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {/* Voice — active */}
          <div
            style={{
              flex: 1,
              padding: "7px",
              borderRadius: 10,
              background: "rgba(45,212,191,0.1)",
              border: "1px solid rgba(45,212,191,0.2)",
              textAlign: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#2DD4BF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
            Voice
          </div>
          {/* Text — switch */}
          <button
            onClick={onSwitchToText}
            style={{
              flex: 1,
              padding: "7px",
              borderRadius: 10,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.07)",
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.35)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              fontFamily: "inherit",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Text
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Icon button ─────────────────────────────────────────────────────────── */
function IconBtn({ onClick, children, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: danger ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.06)",
        border: danger ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.08)",
        color: danger ? "#F87171" : "rgba(255,255,255,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        outline: "none",
      }}
    >
      {children}
    </button>
  );
}

function SpinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.9s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function AIVoicePanel({
  isOpen = false,
  onClose,
  onSwitchToText,
  contextSource: contextSourceProp = "general",
  studentGoal = "",
  autoStart = false,
  onAutoStartHandled,
}) {
  /* Detect context from URL if not supplied */
  const contextSource = contextSourceProp !== "general"
    ? contextSourceProp
    : (typeof window !== "undefined" ? getContextSourceFromPath(window.location.pathname) : "general");

  /* "closed" | "mini" | "expanded" */
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
    status = "idle",
    error,
    transcript,
    isSpeaking = false,
    audioLevel = 0,
    isCapturing = false,
    actionProposals = [],
    latestResult = null,
    startTurn = () => {},
    stopTurn = () => {},
    confirmProposal = async () => null,
    connect,
    disconnect,
  } = session;

  const isActive = status === "active";

  /* Inject fonts */
  useEffect(() => { injectFont(); }, []);

  /* Sync isOpen prop */
  useEffect(() => {
    if (isOpen && panelState === "closed") setPanelState("expanded");
    else if (!isOpen && panelState !== "closed") {
      disconnect?.();
      setPanelState("closed");
    }
  }, [isOpen]); // eslint-disable-line

  /* Load voice config on expand */
  useEffect(() => {
    if (panelState !== "closed" && !voiceConfig) {
      (async () => {
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
        } catch (e) { console.error("Voice config:", e); }
      })();
    }
  }, [panelState, voiceConfig, pipelineEnabled]);

  /* Timer */
  useEffect(() => {
    let t;
    if (isActive) t = setInterval(() => setSessionDuration((s) => s + 1), 1000);
    else setSessionDuration(0);
    return () => clearInterval(t);
  }, [isActive]);

  /* Auto-start */
  useEffect(() => {
    if (!isOpen) { autoStartTriggeredRef.current = false; return; }
    if (autoStart && panelState === "expanded" && voiceConfig && status === "idle" && !autoStartTriggeredRef.current) {
      autoStartTriggeredRef.current = true;
      handleStart(true);
      onAutoStartHandled?.();
    }
  }, [isOpen, autoStart, panelState, voiceConfig, status]); // eslint-disable-line

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleStart = useCallback((byAutoStart = false) => {
    if (!voiceConfig) return;
    connect?.({
      wsUrl: voiceConfig.ws_url,
      contextSource,
      studentGoal,
      sessionMemory: voiceConfig.session_memory,
      voiceName: selectedVoice,
      onboardingContext: voiceConfig.onboarding_context || {},
      initialPrompt: byAutoStart ? (voiceConfig.auto_intro_prompt || "") : "",
      languagePreference: "hinglish",
    });
  }, [voiceConfig, connect, contextSource, studentGoal, selectedVoice]);

  const handleEnd = useCallback(() => {
    disconnect?.();
    setPanelState("closed");
    onClose?.();
  }, [disconnect, onClose]);

  const handleMinimize = useCallback(() => setPanelState("mini"), []);
  const handleExpand   = useCallback(() => setPanelState("expanded"), []);

  const handleSwitchToText = useCallback(() => {
    setSwitchingToText(true);
    setTimeout(() => {
      disconnect?.();
      setPanelState("closed");
      setSwitchingToText(false);
      onSwitchToText?.();
    }, 300);
  }, [disconnect, onSwitchToText]);

  const sharedProps = {
    status, isSpeaking, audioLevel, sessionDuration, formatTime,
    contextSource, studentGoal, voiceConfig, selectedVoice, setSelectedVoice,
    transcript, error, pipelineEnabled, isCapturing,
    latestResult, actionProposals, confirmProposal,
    startTurn, stopTurn,
    onMinimize: handleMinimize,
    onClose: handleEnd,
    onStart: handleStart,
    onEnd: handleEnd,
    onSwitchToText: handleSwitchToText,
    onExpand: handleExpand,
  };

  return (
    <AnimatePresence>
      {panelState === "expanded" && <ExpandedPanel key="expanded" {...sharedProps} />}
      {panelState === "mini"     && (
        <MiniPill
          key="mini"
          isActive={isActive}
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          sessionDuration={sessionDuration}
          formatTime={formatTime}
          onExpand={handleExpand}
          onEnd={handleEnd}
        />
      )}
    </AnimatePresence>
  );
}
