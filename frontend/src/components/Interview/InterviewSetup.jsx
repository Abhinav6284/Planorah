import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

export default function InterviewSetup() {
    const navigate = useNavigate();
    const [jobRole, setJobRole] = useState("");
    const [topic, setTopic] = useState("General Behavioral");
    const [loading, setLoading] = useState(false);

    const handleStart = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await axios.post(`/interview/start/`, {
                job_role: jobRole,
                topic: topic
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate(`/interview/${res.data.id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to start session");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900 font-sans items-center justify-center">
            <div className="w-full p-8 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-700"
                >
                    <div className="text-center mb-10">
                        <div className="text-6xl mb-4">🎤</div>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">AI Mock Interview</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Practice for your dream role with our expert AI interviewer.</p>
                    </div>

                    <form onSubmit={handleStart} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Role</label>
                            <input
                                type="text"
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                placeholder="e.g. Product Manager, Software Engineer"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Focus Topic</label>
                            <select
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                            >
                                <option>General Behavioral</option>
                                <option>Technical Data Structures</option>
                                <option>System Design</option>
                                <option>Soft Skills & Leadership</option>
                                <option>Role Specific Scenarios</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !jobRole}
                            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? "Initializing..." : "Start Interview"}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
