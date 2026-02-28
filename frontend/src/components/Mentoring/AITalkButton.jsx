import React, { useState } from "react";
import { FaBrain } from "react-icons/fa";
import { motion } from "framer-motion";
import AITalkPanel from "./AITalkPanel";

/**
 * Floating "AI Talk" trigger button.
 * Drop this anywhere to add AI mentoring capability to a page.
 *
 * Props:
 *  - contextSource   (string, required)
 *  - studentGoal     (string, optional)
 *  - currentProgress (string, optional)
 *  - mode            ("panel" | "modal")  default "panel"
 *  - className       (string, optional)   extra button classes
 */
export default function AITalkButton({
    contextSource = "general",
    studentGoal = "",
    currentProgress = "",
    mode = "panel",
    className = "",
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(true)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all ${className}`}
            >
                <FaBrain className="text-xs" />
                AI Talk
            </motion.button>

            <AITalkPanel
                isOpen={open}
                onClose={() => setOpen(false)}
                contextSource={contextSource}
                studentGoal={studentGoal}
                currentProgress={currentProgress}
                mode={mode}
            />
        </>
    );
}
