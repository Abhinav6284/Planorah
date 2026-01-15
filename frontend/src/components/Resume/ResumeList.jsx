import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from "../../api/axios";

// Semi-circular Score Gauge Component
const ScoreGauge = ({ score, size = 120 }) => {
    const radius = (size - 16) / 2;
    const circumference = radius * Math.PI; // Half circle
    const offset = circumference - (score / 100) * circumference;

    const getColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
            <svg className="transform" width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
                {/* Background arc */}
                <path
                    d={`M 8 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2}`}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    className="dark:stroke-gray-700"
                />
                {/* Score arc */}
                <motion.path
                    d={`M 8 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2}`}
                    fill="none"
                    stroke={getColor(score)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                <motion.span
                    className="text-2xl font-bold"
                    style={{ color: getColor(score) }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {score}
                </motion.span>
                <span className="text-[10px] text-gray-400">/ 100</span>
            </div>
        </div>
    );
};

// Resume Card Component
const ResumeCard = ({ resume, onEdit, onDelete, onPreview, onAnalyze }) => {


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                            {resume.title?.charAt(0) || 'R'}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{resume.title}</h3>
                            <p className="text-xs text-gray-500">
                                Updated {new Date(resume.updated_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${resume.ats_score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        resume.ats_score >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        {resume.ats_score ? 'Analyzed' : 'Not Analyzed'}
                    </span>
                </div>

                {/* Score Gauge */}
                <div className="flex justify-center mb-4">
                    <ScoreGauge score={resume.ats_score || 0} />
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {resume.ats_score ? `Resume is ${100 - resume.ats_score} pts from ideal` : 'Analyze to see score'}
                </p>

                {/* Quick Stats */}
                {resume.ats_score && (
                    <div className="flex justify-center gap-4 mb-4 text-xs">
                        <div className="flex items-center gap-1 text-red-500">
                            <span>⚠️</span>
                            <span>{resume.issues || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                            <span>💡</span>
                            <span>{resume.suggestions || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                            <span>✓</span>
                            <span>{resume.passed || 0}</span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                    <p className="text-xs text-gray-500 mb-3">Actions</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onPreview(resume)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            👁️ Preview
                        </button>
                        <button
                            onClick={() => onEdit(resume)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={() => onAnalyze(resume)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                            📊 Analyze
                        </button>
                        <button
                            onClick={() => onDelete(resume.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Job Match Modal
const JobMatchModal = ({ isOpen, onClose, resume, onMatch }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleMatch = async () => {
        if (!jobDescription.trim()) return;
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            const response = await axios.post(`${API_BASE_URL}/api/resume/analyze-ats/`, {
                resume_id: resume.id,
                job_description: jobDescription
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(response.data);
        } catch (err) {
            console.error('Match failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        🎯 Job Match Analysis
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        See how "{resume?.title}" matches against a job description
                    </p>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {!result ? (
                        <>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Paste Job Description
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the full job description here to see how well your resume matches..."
                                rows={8}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 outline-none resize-none"
                            />
                            <button
                                onClick={handleMatch}
                                disabled={!jobDescription.trim() || loading}
                                className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Analyzing Match...
                                    </>
                                ) : (
                                    '🔍 Analyze Match'
                                )}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-6">
                            {/* Match Score */}
                            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                                <div className={`text-5xl font-bold ${result.overall_score >= 80 ? 'text-green-500' :
                                    result.overall_score >= 60 ? 'text-yellow-500' : 'text-red-500'
                                    }`}>
                                    {result.overall_score}%
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">Job Match Score</p>
                            </div>

                            {/* Missing Keywords */}
                            {result.missing_keywords?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                        🔍 Add These Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missing_keywords.map((kw, i) => (
                                            <span key={i} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm">
                                                + {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggestions */}
                            {result.suggestions?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                        💡 Suggestions
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.suggestions.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="text-green-500">•</span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                onClick={() => setResult(null)}
                                className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                            >
                                ← Try Another Job
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

// Import & Analyze Modal
const ImportAnalyzeModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [step, setStep] = useState('upload'); // upload, analyzing, results
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFile = (f) => {
        const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
        if (!['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg'].includes(ext)) {
            setError('Please upload PDF, DOCX, TXT, or image files.');
            return;
        }
        setFile(f);
        setError('');
    };

    const analyzeAndImport = async () => {
        if (!file) return;
        setStep('analyzing');

        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);

        try {
            // First analyze
            const atsResponse = await axios.post(`${API_BASE_URL}/api/resume/analyze-ats/`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setResult(atsResponse.data);
            setStep('results');
        } catch (err) {
            setError(err.response?.data?.error || 'Analysis failed');
            setStep('upload');
        }
    };

    const importResume = async () => {
        if (!file) return;

        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/resume/import/`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            onSuccess(response.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Import failed');
        }
    };

    const resetModal = () => {
        setFile(null);
        setStep('upload');
        setResult(null);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { resetModal(); onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        📥 Import & Analyze Resume
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Upload a resume to see ATS score before importing
                    </p>
                </div>

                <div className="p-6">
                    {step === 'upload' && (
                        <>
                            <div
                                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragActive || file ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
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
                                    <div>
                                        <div className="text-4xl mb-2">✅</div>
                                        <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                        <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-sm text-red-500 mt-2">Remove</button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-4xl mb-2 opacity-50">📁</div>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            <span className="text-green-600 font-medium">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, or images</p>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <p className="mt-3 text-sm text-red-500">{error}</p>
                            )}

                            <button
                                onClick={analyzeAndImport}
                                disabled={!file}
                                className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium disabled:opacity-50"
                            >
                                📊 Analyze & Preview
                            </button>
                        </>
                    )}

                    {step === 'analyzing' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 dark:text-white">Analyzing resume...</p>
                            <p className="text-sm text-gray-500 mt-1">Checking ATS compatibility</p>
                        </div>
                    )}

                    {step === 'results' && result && (
                        <div className="space-y-4">
                            {/* Score */}
                            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className={`text-5xl font-bold ${result.overall_score >= 80 ? 'text-green-500' :
                                    result.overall_score >= 60 ? 'text-yellow-500' : 'text-red-500'
                                    }`}>
                                    {result.overall_score}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">ATS Score</p>
                                <p className="text-xs text-gray-400 mt-2">{result.summary}</p>
                            </div>

                            {/* Quick issues */}
                            {result.suggestions?.slice(0, 3).map((s, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="text-yellow-500">💡</span>
                                    {s}
                                </div>
                            ))}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setStep('upload')}
                                    className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={importResume}
                                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                >
                                    📥 Import Resume
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function ResumeList() {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedResume, setSelectedResume] = useState(null);
    const [showJobMatch, setShowJobMatch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            const response = await axios.get(`${API_BASE_URL}/api/resume/list/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Add mock ATS scores for demo
            const resumesWithScores = response.data.map(r => ({
                ...r,
                ats_score: r.ats_score || Math.floor(Math.random() * 40) + 50,
                issues: Math.floor(Math.random() * 5),
                suggestions: Math.floor(Math.random() * 8) + 2,
                passed: Math.floor(Math.random() * 10) + 5
            }));
            setResumes(resumesWithScores);
        } catch (error) {
            console.error('Failed to fetch resumes:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteResume = async (id) => {
        if (!window.confirm('Delete this resume?')) return;
        try {
            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            await axios.delete(`${API_BASE_URL}/api/resume/${id}/delete/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumes(resumes.filter(r => r.id !== id));
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const handleImportSuccess = (data) => {
        navigate(`/resume/${data.id}`);
    };

    const filteredResumes = resumes.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Resume Builder</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ATS friendly resume that will make you stand out
                    </p>
                    <div className="mt-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm inline-block">
                        View and edit your existing resumes or create a new one
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search resume..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 outline-none"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            📥 Import Resume
                        </button>
                        <button
                            onClick={() => navigate('/resume/new')}
                            className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            ➕ Craft a Resume
                        </button>
                    </div>
                </div>

                {/* Resume Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
                    </div>
                ) : filteredResumes.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
                        <div className="text-5xl mb-4">📄</div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resumes yet</h3>
                        <p className="text-gray-500 mb-4">Create your first ATS-optimized resume</p>
                        <button
                            onClick={() => navigate('/resume/new')}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium"
                        >
                            Create Resume
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResumes.map((resume) => (
                            <ResumeCard
                                key={resume.id}
                                resume={resume}
                                onEdit={(r) => navigate(`/resume/${r.id}`)}
                                onDelete={deleteResume}
                                onPreview={(r) => window.open(`/resume/${r.id}`, '_blank')}
                                onAnalyze={(r) => { setSelectedResume(r); setShowJobMatch(true); }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <ImportAnalyzeModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={handleImportSuccess}
            />
            <AnimatePresence>
                {showJobMatch && selectedResume && (
                    <JobMatchModal
                        isOpen={showJobMatch}
                        onClose={() => { setShowJobMatch(false); setSelectedResume(null); }}
                        resume={selectedResume}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
