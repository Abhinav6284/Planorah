import React, { useState } from "react";
import { motion } from "framer-motion";
import AITalkPanel from "./AITalkPanel";
import AIVoicePanel from "./AIVoicePanel";

/**
 * Floating AI mentor trigger — voice + text.
 * Drop this anywhere to add mentoring to a page.
 *
 * Props: contextSource, studentGoal, currentProgress, mode, className
 */
export default function AITalkButton({
  contextSource = "general",
  studentGoal = "",
  currentProgress = "",
  mode = "panel",
  className = "",
}) {
  const [textOpen, setTextOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  const openText  = () => { setVoiceOpen(false); setTextOpen(true); };
  const openVoice = () => { setTextOpen(false); setVoiceOpen(true); };

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
        {/* ── Voice button ── */}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={openVoice}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "8px 16px 8px 9px",
            borderRadius: 100,
            background: "rgba(13,148,136,0.1)",
            border: "1px solid rgba(45,212,191,0.22)",
            color: "#2DD4BF",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            letterSpacing: "-0.01em",
          }}
        >
          {/* Mini teal orb */}
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
              background:
                "radial-gradient(circle at 38% 32%, #A7F3D0 0%, #2DD4BF 22%, #0D9488 58%, #042F2E 100%)",
              boxShadow: "0 0 10px rgba(45,212,191,0.4)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.6) 0%, transparent 45%)",
                mixBlendMode: "overlay",
              }}
            />
          </div>
          Voice
        </motion.button>

        {/* ── Text / Chat button ── */}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={openText}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "8px 16px 8px 9px",
            borderRadius: 100,
            background: "rgba(99,102,241,0.09)",
            border: "1px solid rgba(129,140,248,0.22)",
            color: "#818CF8",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            letterSpacing: "-0.01em",
          }}
        >
          {/* Mini indigo orb */}
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
              background:
                "radial-gradient(circle at 38% 32%, #C4B5FD 0%, #818CF8 22%, #4F46E5 58%, #1E1B4B 100%)",
              boxShadow: "0 0 10px rgba(129,140,248,0.4)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.55) 0%, transparent 45%)",
                mixBlendMode: "overlay",
              }}
            />
          </div>
          AI Chat
        </motion.button>
      </div>

      <AITalkPanel
        isOpen={textOpen}
        onClose={() => setTextOpen(false)}
        onSwitchToVoice={openVoice}
        contextSource={contextSource}
        studentGoal={studentGoal}
        currentProgress={currentProgress}
        mode={mode}
      />

      <AIVoicePanel
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSwitchToText={openText}
        contextSource={contextSource}
        studentGoal={studentGoal}
      />
    </>
  );
}
