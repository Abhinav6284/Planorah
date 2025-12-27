import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function ImportResumeModal({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [atsResult, setAtsResult] = useState(null);
    const [error, setError] = useState('');
    const [step, setStep] = useState('upload'); // 'upload', 'analyzing', 'results'
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (selectedFile) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const validExtensions = ['.pdf', '.docx', '.txt'];

        const ext = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
        if (!validExtensions.includes(ext)) {
            setError('Please upload a PDF, DOCX, or TXT file.');
            return;
        }

        setFile(selectedFile);
        setError('');
    };

    const handleImport = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://142.93.214.77/api/resume/import/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Success - resume imported
            if (onSuccess) {
                onSuccess(response.data);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to import resume. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleAnalyzeATS = async () => {
        if (!file) return;

        setStep('analyzing');
        setAnalyzing(true);
        setError('');

        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://142.93.214.77/api/resume/analyze-ats/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setAtsResult(response.data);
            setStep('results');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to analyze resume. Please try again.');
            setStep('upload');
        } finally {
            setAnalyzing(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const resetModal = () => {
        setFile(null);
        setAtsResult(null);
        setStep('upload');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => { resetModal(); onClose(); }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {step === 'results' ? 'ATS Analysis Results' : 'Import Resume'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {step === 'upload' && 'Upload your resume to import or check ATS score'}
                                {step === 'analyzing' && 'Analyzing your resume...'}
                                {step === 'results' && 'See how your resume scores against ATS systems'}
                            </p>
                        </div>
                        <button
                            onClick={() => { resetModal(); onClose(); }}
                            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {step === 'upload' && (
                            <>
                                {/* Drag & Drop Zone */}
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
                                                : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.docx,.txt"
                                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                        className="hidden"
                                    />

                                    {file ? (
                                        <div className="space-y-2">
                                            <div className="text-4xl">📄</div>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</p>
                                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                className="text-sm text-red-500 hover:text-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="text-5xl text-gray-300">📁</div>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="text-green-600 font-medium">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-400">PDF, DOCX, or TXT (max 10MB)</p>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={handleAnalyzeATS}
                                        disabled={!file || analyzing}
                                        className="flex-1 py-3 border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        📊 Check ATS Score
                                    </button>
                                    <button
                                        onClick={handleImport}
                                        disabled={!file || uploading}
                                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Importing...
                                            </>
                                        ) : (
                                            '📥 Import & Edit'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 'analyzing' && (
                            <div className="text-center py-12">
                                <div className="inline-block w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">Analyzing your resume...</p>
                                <p className="text-sm text-gray-500 mt-2">Our AI is checking ATS compatibility</p>
                            </div>
                        )}

                        {step === 'results' && atsResult && (
                            <div className="space-y-6">
                                {/* Overall Score */}
                                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className={`text-6xl font-bold ${getScoreColor(atsResult.overall_score)}`}>
                                        {atsResult.overall_score}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Overall ATS Score</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                                        {atsResult.summary}
                                    </p>
                                </div>

                                {/* Category Scores */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Category Breakdown</h3>
                                    {atsResult.categories && Object.entries(atsResult.categories).map(([key, data]) => (
                                        <div key={key} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400 capitalize">
                                                    {key.replace(/_/g, ' ')}
                                                </span>
                                                <span className={`font-medium ${getScoreColor(data.score)}`}>
                                                    {data.score}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getScoreBg(data.score)} transition-all`}
                                                    style={{ width: `${data.score}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">{data.feedback}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Suggestions */}
                                {atsResult.suggestions?.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">💡 Suggestions</h3>
                                        <ul className="space-y-2">
                                            {atsResult.suggestions.map((suggestion, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="text-green-500 mt-0.5">•</span>
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Missing Keywords */}
                                {atsResult.missing_keywords?.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">🔍 Consider Adding</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {atsResult.missing_keywords.map((keyword, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm"
                                                >
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={() => setStep('upload')}
                                        className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={handleImport}
                                        disabled={uploading}
                                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {uploading ? 'Importing...' : '📥 Import & Improve'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
