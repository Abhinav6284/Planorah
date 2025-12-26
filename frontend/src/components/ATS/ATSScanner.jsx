import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import CircularGauge from "../common/CircularGauge";

export default function ATSScanner() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [myResumes, setMyResumes] = useState([]);
    const [inputMode, setInputMode] = useState("select"); // 'select' or 'manual'

    const [formData, setFormData] = useState({
        job_role: "",
        job_description: "",
        resume_text: ""
    });

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await axios.get("http://127.0.0.1:8000/api/resume/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyResumes(res.data);
        } catch (err) {
            console.error("Failed to load resumes", err);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleResumeSelect = (resumeId) => {
        if (!resumeId) return;
        const resume = myResumes.find(r => r.id === parseInt(resumeId));
        if (resume) {
            // Strip HTML for ATS text analysis
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = resume.generated_content;
            const textContent = tempDiv.textContent || tempDiv.innerText || "";
            setFormData({ ...formData, resume_text: textContent });
        }
    };

    const handleScan = async () => {
        if (!formData.job_description || !formData.resume_text) {
            setError("Please provide both Job Description and Resume content.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.post("http://127.0.0.1:8000/api/ats/analyze/", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200 font-sans">
            <div className="p-8">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">ATS Scanner</h1>
                        <p className="text-gray-500 dark:text-gray-400">Optimize your resume against Job Descriptions.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-20">

                    {/* LEFT PANEL: INPUT */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="xl:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">

                            {/* Job Details */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Job Role</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-900 dark:text-white"
                                    placeholder="e.g. Senior Product Designer"
                                    value={formData.job_role}
                                    onChange={(e) => handleInputChange("job_role", e.target.value)}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Description</label>
                                <textarea
                                    className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-900 dark:text-white resize-none"
                                    placeholder="Paste the JD here..."
                                    value={formData.job_description}
                                    onChange={(e) => handleInputChange("job_description", e.target.value)}
                                />
                            </div>

                            {/* Resume Input Toggle */}
                            <div className="mb-6">
                                <div className="flex gap-4 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                    <button
                                        onClick={() => setInputMode('select')}
                                        className={`pb-2 text-sm font-bold ${inputMode === 'select' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-400'}`}
                                    >
                                        Select Resume
                                    </button>
                                    <button
                                        onClick={() => setInputMode('manual')}
                                        className={`pb-2 text-sm font-bold ${inputMode === 'manual' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-400'}`}
                                    >
                                        Paste Text
                                    </button>
                                </div>

                                {inputMode === 'select' ? (
                                    <div>
                                        {myResumes.length > 0 ? (
                                            <select
                                                onChange={(e) => handleResumeSelect(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-900 dark:text-white appearance-none"
                                            >
                                                <option value="">Select a generated resume...</option>
                                                {myResumes.map(r => (
                                                    <option key={r.id} value={r.id}>{r.title || "Untitled Resume"} ({new Date(r.created_at).toLocaleDateString()})</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-sm text-gray-500">No resumes found. <a href="/resume" className="underline text-blue-500">Create one first</a> or use Paste Text.</div>
                                        )}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-900 dark:text-white resize-none"
                                        placeholder="Paste resume text here..."
                                        value={formData.resume_text}
                                        onChange={(e) => handleInputChange("resume_text", e.target.value)}
                                    />
                                )}
                            </div>

                            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

                            <button
                                onClick={handleScan}
                                disabled={loading}
                                className="w-full mt-2 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {loading ? "Analyzing..." : "Analyze Match 🎯"}
                            </button>
                        </div>
                    </motion.div>

                    {/* RIGHT PANEL: RESULTS */}
                    <div className="xl:col-span-8">
                        <AnimatePresence>
                            {result ? (
                                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">

                                    {/* Top Card: Score & Quick Stats */}
                                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8">

                                        {/* Matches Pro Gauge Style */}
                                        <div className="flex-shrink-0">
                                            <CircularGauge score={result.match_score} />
                                        </div>

                                        <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl text-center">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Keywords</div>
                                                <div className="text-xl font-bold text-gray-900 dark:text-white">{result.missing_keywords.length > 0 ? "Missing" : "Great"}</div>
                                                <div className="text-xs text-red-500">{result.missing_keywords.length} alerts</div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl text-center">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Strengths</div>
                                                <div className="text-xl font-bold text-green-600">{result.strength_areas.length}</div>
                                                <div className="text-xs text-green-500">Detected</div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl text-center">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Improvement</div>
                                                <div className="text-xl font-bold text-blue-600">{result.improvement_areas.length}</div>
                                                <div className="text-xs text-blue-500">Tips</div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <span className="text-2xl">📥</span>
                                                <span className="text-xs font-bold mt-1">Download</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary Card */}
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">AI Analysis</h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{result.summary_feedback}</p>
                                    </div>

                                    {/* Detailed Insights */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 text-sm">⚠️</div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">Missing Keywords</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {result.missing_keywords.map((kw, i) => (
                                                    <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/20">{kw}</span>
                                                ))}
                                                {result.missing_keywords.length === 0 && <span className="text-gray-400 italic">None! Good job.</span>}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 text-sm">⚡</div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">Strengths</h3>
                                            </div>
                                            <ul className="space-y-2">
                                                {result.strength_areas.slice(0, 4).map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-sm">💡</div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">Actionable Improvements</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {result.improvement_areas.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/5">
                                                    <span className="text-blue-500 mt-0.5">•</span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-200">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl min-h-[500px] bg-white/50 dark:bg-gray-800/50">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 text-4xl">
                                        📄
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Analyze</h3>
                                    <p className="max-w-md text-center">Paste a Job Description and a Resume to get a comprehensive ATS score and actionable feedback.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
