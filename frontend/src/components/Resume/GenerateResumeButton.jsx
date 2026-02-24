import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaFileAlt, FaSpinner } from "react-icons/fa";
import resumeService from "../../api/resumeService";

export default function GenerateResumeButton({ roadmapId, onSuccess }) {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);

        try {
            const result = await resumeService.generateResume(roadmapId);

            if (onSuccess) {
                onSuccess(result.resume);
            }
        } catch (err) {
            console.error("Failed to generate resume:", err);
            setError(err.response?.data?.error || "Failed to generate resume. Ensure you have completed tasks.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div>
            <motion.button
                onClick={handleGenerate}
                disabled={generating}
                whileHover={{ scale: generating ? 1 : 1.02 }}
                whileTap={{ scale: generating ? 1 : 0.98 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg ${generating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    }`}
            >
                {generating ? (
                    <>
                        <FaSpinner className="animate-spin" />
                        <span>Compiling...</span>
                    </>
                ) : (
                    <>
                        <FaFileAlt />
                        <span>Generate Resume</span>
                    </>
                )}
            </motion.button>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400"
                >
                    {error}
                </motion.div>
            )}
        </div>
    );
}
