import React, { useState } from "react";
import { FaBrain, FaMicrophone } from "react-icons/fa";
import { motion } from "framer-motion";
import AITalkPanel from "./AITalkPanel";
import AIVoicePanel from "./AIVoicePanel";

// activeMode: null | "text" | "voice"

/**
 * Floating "AI Talk" trigger buttons (Text + Voice).
 * Drop this anywhere to add AI mentoring capability to a page.
 *
 * Props:
 *  - contextSource   (string, required)
 *  - studentGoal     (string, optional)
 *  - currentProgress (string, optional)
 *  - mode            ("panel" | "modal")  default "panel" (for text chat)
 *  - className       (string, optional)   extra wrapper classes
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

    const openText = () => { setVoiceOpen(false); setTextOpen(true); };
    const openVoice = () => { setTextOpen(false); setVoiceOpen(true); };

    return (
        <>
            <div className={`inline-flex items-center gap-2 ${className}`}>
                {/* Text chat button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openText()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                >
                    <FaBrain className="text-xs" />
                    AI Chat
                </motion.button>

                {/* Voice button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openVoice()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                >
                    <FaMicrophone className="text-xs" />
                    AI Talk
                </motion.button>
            </div>

            {/* Text chat panel */}
            <AITalkPanel
                isOpen={textOpen}
                onClose={() => setTextOpen(false)}
                onSwitchToVoice={openVoice}
                contextSource={contextSource}
                studentGoal={studentGoal}
                currentProgress={currentProgress}
                mode={mode}
            />

            {/* Voice panel */}
            <AIVoicePanel
                isOpen={voiceOpen}
                onClose={() => setVoiceOpen(false)}
                onSwitchToText={openText}
                contextSource={contextSource}
                studentGoal={studentGoal}
                currentProgress={currentProgress}
            />
        </>
    );
}
