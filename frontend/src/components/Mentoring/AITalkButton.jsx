import React, { useState } from "react";
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
            <div className={`flex flex-wrap items-center gap-3 ${className}`}>
                {/* Voice chat button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openVoice()}
                    className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-charcoal border border-gray-200 dark:border-charcoalMuted/50 rounded-full text-gray-800 dark:text-gray-200 text-[15px] font-medium shadow-sm hover:shadow transition-all"
                >
                    <div className="relative w-6 h-6 rounded-full bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-blue-500 via-cyan-400 to-blue-500 shadow-sm border border-blue-400/20 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-300/40 to-transparent mix-blend-overlay" />
                    </div>
                    Voice chat
                </motion.button>

                {/* Text chat button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openText()}
                    className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-charcoal border border-gray-200 dark:border-charcoalMuted/50 rounded-full text-gray-800 dark:text-gray-200 text-[15px] font-medium shadow-sm hover:shadow transition-all"
                >
                    <div className="relative w-6 h-6 rounded-full bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-purple-500 via-fuchsia-400 to-purple-500 shadow-sm border border-purple-400/20 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-300/40 to-transparent mix-blend-overlay" />
                    </div>
                    AI Chat
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
