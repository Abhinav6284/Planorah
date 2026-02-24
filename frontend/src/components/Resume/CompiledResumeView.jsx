import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle, FaExternalLinkAlt, FaDownload, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import resumeService from "../../api/resumeService";

export default function CompiledResumeView() {
    const { versionId } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [verification, setVerification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchResume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [versionId]);

    const fetchResume = async () => {
        try {
            const data = await resumeService.getResumeVersion(versionId);
            setResume(data);
        } catch (err) {
            console.error("Failed to fetch resume:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setVerifying(true);
        try {
            const result = await resumeService.verifyResume(versionId);
            setVerification(result);
        } catch (err) {
            console.error("Failed to verify resume:", err);
        } finally {
            setVerifying(false);
        }
    };

    const handleExport = async (format) => {
        setExporting(true);
        try {
            const result = await resumeService.exportResume(versionId, format);

            if (format === 'markdown') {
                // Download markdown file
                const blob = new Blob([result.markdown], { type: 'text/markdown' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resume_v${resume.version_number}.md`;
                a.click();
            } else {
                // Download JSON
                const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resume_v${resume.version_number}.json`;
                a.click();
            }
        } catch (err) {
            console.error("Failed to export resume:", err);
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Resume Not Found</h2>
                    <button
                        onClick={() => navigate('/roadmap')}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Back to Roadmaps
                    </button>
                </div>
            </div>
        );
    }

    const content = resume.compiled_content || {};
    const header = content.header || {};
    const sections = content.sections || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-5xl mx-auto p-4 sm:p-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/roadmap')}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                        <FaArrowLeft />
                        <span>Back to Roadmaps</span>
                    </button>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Compiled Resume
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Version {resume.version_number} • Generated {new Date(resume.generated_at).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleVerify}
                                disabled={verifying}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                                <FaShieldAlt />
                                {verifying ? "Verifying..." : "Verify Proof"}
                            </button>

                            <div className="relative group">
                                <button
                                    disabled={exporting}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                                >
                                    <FaDownload />
                                    {exporting ? "Exporting..." : "Export"}
                                </button>
                                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    <button
                                        onClick={() => handleExport('json')}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                                    >
                                        JSON
                                    </button>
                                    <button
                                        onClick={() => handleExport('markdown')}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                                    >
                                        Markdown
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-green-600">{resume.total_tasks_completed}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-blue-600">{resume.core_tasks_completed}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Core Tasks</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-purple-600">{resume.average_score?.toFixed(1)}%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-orange-600">{resume.entries?.length || 0}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Resume Lines</div>
                        </div>
                    </div>
                </div>

                {/* Verification Results */}
                {verification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl border ${verification.all_valid
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            {verification.all_valid ? (
                                <>
                                    <FaCheckCircle className="text-green-600 text-xl" />
                                    <div>
                                        <div className="font-semibold text-green-900 dark:text-green-400">
                                            All Proof Valid
                                        </div>
                                        <div className="text-sm text-green-700 dark:text-green-500">
                                            {verification.valid_entries} of {verification.total_entries} entries verified
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FaExclamationTriangle className="text-yellow-600 text-xl" />
                                    <div>
                                        <div className="font-semibold text-yellow-900 dark:text-yellow-400">
                                            Some Entries Invalid
                                        </div>
                                        <div className="text-sm text-yellow-700 dark:text-yellow-500">
                                            {verification.invalid_entries} entries have invalid or revoked proof
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Resume Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header Section */}
                    <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {header.name}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">{header.roadmap}</p>
                    </div>

                    {/* Sections */}
                    {sections.map((section, idx) => (
                        <div key={idx} className="p-8 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                {section.name}
                                <span className="text-sm font-normal text-gray-500">
                                    ({section.entries?.length || 0})
                                </span>
                            </h3>

                            <div className="space-y-6">
                                {section.entries?.map((entry, entryIdx) => (
                                    <motion.div
                                        key={entryIdx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: entryIdx * 0.05 }}
                                        className="border-l-4 border-green-500 pl-4"
                                    >
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {entry.title}
                                            </h4>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                                    {entry.score?.toFixed(0)}%
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                                    Weight: {entry.weight}/5
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {entry.description}
                                        </p>

                                        {entry.proof_url && (
                                            <a
                                                href={entry.proof_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline"
                                            >
                                                <FaExternalLinkAlt className="text-xs" />
                                                View Proof
                                            </a>
                                        )}

                                        {entry.tags && entry.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {entry.tags.map((tag, tagIdx) => (
                                                    <span
                                                        key={tagIdx}
                                                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Traceability Info */}
                                        {verification && (
                                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                                                Source: Task {entry.task_id?.slice(0, 8)} • Attempt {entry.attempt_id?.slice(0, 8)}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
