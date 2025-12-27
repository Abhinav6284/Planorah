import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Circular Score Component
const CircularScore = ({ score, size = 160, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (score) => {
        if (score >= 80) return { stroke: '#10b981', bg: '#d1fae5', text: 'text-green-500' };
        if (score >= 60) return { stroke: '#f59e0b', bg: '#fef3c7', text: 'text-yellow-500' };
        return { stroke: '#ef4444', bg: '#fee2e2', text: 'text-red-500' };
    };

    const colors = getColor(score);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="dark:stroke-gray-700"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.stroke}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className={`text-4xl font-bold ${colors.text}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    {score}
                </motion.span>
                <span className="text-sm text-gray-500 dark:text-gray-400">out of 100</span>
            </div>
        </div>
    );
};

// Category Score Bar
const CategoryBar = ({ label, score, feedback, icon, delay = 0 }) => {
    const getColor = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="space-y-2"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{label}</span>
                </div>
                <span className={`font-bold ${score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {score}%
                </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${getColor(score)} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
                />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{feedback}</p>
        </motion.div>
    );
};

export default function ATSScanner() {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('upload');
    const fileInputRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFile = (selectedFile) => {
        const validExtensions = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg'];
        const ext = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));

        if (!validExtensions.includes(ext)) {
            setError('Please upload PDF, DOCX, TXT, or image files (PNG, JPG).');
            return;
        }

        setFile(selectedFile);
        setError('');
    };

    const analyzeResume = async () => {
        if (!file) return;

        setAnalyzing(true);
        setError('');
        setActiveTab('analyzing');

        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);
        if (jobDescription.trim()) {
            formData.append('job_description', jobDescription);
        }

        try {
            const response = await axios.post('http://142.93.214.77/api/resume/analyze-ats/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setResult(response.data);
            setActiveTab('results');
        } catch (err) {
            setError(err.response?.data?.error || 'Analysis failed. Please try again.');
            setActiveTab('upload');
        } finally {
            setAnalyzing(false);
        }
    };

    const resetScanner = () => {
        setFile(null);
        setJobDescription('');
        setResult(null);
        setError('');
        setActiveTab('upload');
    };

    const categoryIcons = {
        keywords_skills: '🎯',
        formatting: '📐',
        experience: '💼',
        education: '🎓',
        contact_info: '📧'
    };

    const categoryLabels = {
        keywords_skills: 'Keywords & Skills',
        formatting: 'Format & Structure',
        experience: 'Experience',
        education: 'Education',
        contact_info: 'Contact Info'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Find Your Perfect Fit ✨
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Upload your resume · Paste a job description · See if you're the one
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Panel - Upload & Job Description */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Upload Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                📄 Upload Resume
                            </h2>

                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragActive
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : file
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                    className="hidden"
                                />

                                {file ? (
                                    <div className="space-y-2">
                                        <div className="text-4xl">✅</div>
                                        <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="text-sm text-red-500 hover:text-red-600 underline"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="text-5xl opacity-50">📁</div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="text-green-600 font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, or Images (PNG, JPG)</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
                                >
                                    ⚠️ {error}
                                </motion.div>
                            )}
                        </div>

                        {/* Job Description Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                💼 Job Description <span className="text-xs font-normal text-gray-400">(optional)</span>
                            </h2>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here for better keyword matching..."
                                rows={6}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Adding a job description helps identify missing keywords and improve matching score
                            </p>
                        </div>

                        {/* Analyze Button */}
                        <motion.button
                            onClick={analyzeResume}
                            disabled={!file || analyzing}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-3"
                        >
                            {analyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    🔍 Analyze Resume
                                </>
                            )}
                        </motion.button>
                    </motion.div>

                    {/* Right Panel - Results */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AnimatePresence mode="wait">
                            {activeTab === 'upload' && !result && (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center h-full flex flex-col items-center justify-center min-h-[500px]"
                                >
                                    <div className="text-6xl mb-4 opacity-30">📊</div>
                                    <h3 className="text-xl font-semibold text-gray-400 dark:text-gray-500 mb-2">
                                        Results will appear here
                                    </h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">
                                        Upload your resume and click analyze to see how it performs against ATS systems
                                    </p>
                                </motion.div>
                            )}

                            {activeTab === 'analyzing' && (
                                <motion.div
                                    key="analyzing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center h-full flex flex-col items-center justify-center min-h-[500px]"
                                >
                                    <div className="relative mb-6">
                                        <div className="w-24 h-24 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl">🔍</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        Analyzing your resume...
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Our AI is checking ATS compatibility, keywords, formatting, and more
                                    </p>
                                    <div className="mt-6 space-y-2 w-full max-w-xs">
                                        {['Extracting text...', 'Analyzing keywords...', 'Checking format...'].map((step, i) => (
                                            <motion.div
                                                key={step}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.5 }}
                                                className="flex items-center gap-2 text-sm text-gray-500"
                                            >
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                {step}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'results' && result && (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Overall Score Card */}
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                    Overall ATS Score
                                                </h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                                                    {result.summary}
                                                </p>
                                            </div>
                                            <CircularScore score={result.overall_score} />
                                        </div>
                                    </div>

                                    {/* Category Breakdown */}
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                            Category Breakdown
                                        </h2>
                                        <div className="space-y-5">
                                            {result.categories && Object.entries(result.categories).map(([key, data], index) => (
                                                <CategoryBar
                                                    key={key}
                                                    label={categoryLabels[key] || key}
                                                    score={data.score}
                                                    feedback={data.feedback}
                                                    icon={categoryIcons[key] || '📌'}
                                                    delay={index * 0.1}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Suggestions */}
                                    {result.suggestions?.length > 0 && (
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                💡 Improvement Suggestions
                                            </h2>
                                            <ul className="space-y-3">
                                                {result.suggestions.map((suggestion, idx) => (
                                                    <motion.li
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.5 + idx * 0.1 }}
                                                        className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                                                    >
                                                        <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-sm">{suggestion}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Missing Keywords */}
                                    {result.missing_keywords?.length > 0 && (
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                🔍 Keywords to Add
                                            </h2>
                                            <div className="flex flex-wrap gap-2">
                                                {result.missing_keywords.map((keyword, idx) => (
                                                    <motion.span
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.8 + idx * 0.05 }}
                                                        className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium"
                                                    >
                                                        + {keyword}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Scan Again Button */}
                                    <button
                                        onClick={resetScanner}
                                        className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                                    >
                                        🔄 Scan Another Resume
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 grid md:grid-cols-4 gap-4"
                >
                    {[
                        { icon: '🔍', title: 'AI-Powered', desc: 'Advanced analysis using Gemini AI' },
                        { icon: '📄', title: 'Multi-Format', desc: 'PDF, DOCX, TXT & images' },
                        { icon: '🎯', title: 'Keyword Match', desc: 'Match against job descriptions' },
                        { icon: '💡', title: 'Smart Tips', desc: 'Get actionable improvements' }
                    ].map((feature, idx) => (
                        <div
                            key={idx}
                            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center"
                        >
                            <div className="text-2xl mb-2">{feature.icon}</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{feature.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
