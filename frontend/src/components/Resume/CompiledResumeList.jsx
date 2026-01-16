import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFileAlt, FaCheckCircle, FaClock, FaEye } from "react-icons/fa";
import resumeService from "../../api/resumeService";

export default function CompiledResumeList() {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const data = await resumeService.getResumeHistory();
            setResumes(data);
        } catch (err) {
            console.error("Failed to fetch resumes:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-6xl mx-auto p-4 sm:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        My Compiled Resumes
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Resumes automatically generated from your validated task completions
                    </p>
                </div>

                {resumes.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <FaFileAlt className="mx-auto text-5xl text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Resumes Yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Complete tasks on a roadmap and generate your first compiled resume
                        </p>
                        <button
                            onClick={() => navigate('/roadmap')}
                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            View Roadmaps
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {resumes.map((resume, index) => (
                            <motion.div
                                key={resume.version_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => navigate(`/resume/compiled/${resume.version_id}`)}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                            <FaFileAlt className="text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Version {resume.version_number}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(resume.generated_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {resume.is_latest && (
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                                            Latest
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Total Tasks</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {resume.total_tasks_completed}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Core Tasks</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {resume.core_tasks_completed}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Average Score</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                            {resume.average_score?.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {resume.was_eligible ? (
                                        <>
                                            <FaCheckCircle className="text-green-500" />
                                            <span className="text-sm text-green-600 dark:text-green-400">
                                                Eligible at generation
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <FaClock className="text-yellow-500" />
                                            <span className="text-sm text-yellow-600 dark:text-yellow-400">
                                                In progress
                                            </span>
                                        </>
                                    )}
                                </div>

                                <button
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <FaEye />
                                    View Resume
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
