import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTemplates } from './templates';

export default function TemplateModal({ isOpen, onClose, currentTemplate, onSelect }) {
    const templates = getAllTemplates();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Choose Template</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select a professional template for your resume</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Template Grid */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        <div className="grid grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => {
                                        onSelect(template.id);
                                        onClose();
                                    }}
                                    className={`group relative p-4 rounded-xl border-2 transition-all hover:shadow-lg ${currentTemplate === template.id
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                        }`}
                                >
                                    {/* Template Preview */}
                                    <div className="aspect-[8.5/11] bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center text-4xl overflow-hidden">
                                        {template.id === 'professional' && (
                                            <div className="w-full h-full bg-white p-2 text-left">
                                                <div className="text-center border-b border-gray-300 pb-1 mb-1">
                                                    <div className="text-[8px] font-bold text-gray-800 uppercase tracking-wide">JOHN DOE</div>
                                                    <div className="text-[5px] text-gray-500">Software Engineer</div>
                                                </div>
                                                <div className="text-[5px] text-gray-400 mb-1 font-bold uppercase">Experience</div>
                                                <div className="text-[4px] text-gray-600 leading-tight">Senior Dev at Tech Corp</div>
                                                <div className="text-[5px] text-gray-400 mt-1 mb-1 font-bold uppercase">Education</div>
                                                <div className="text-[4px] text-gray-600">B.Tech Computer Science</div>
                                            </div>
                                        )}
                                        {template.id === 'modern' && (
                                            <div className="w-full h-full bg-white p-2 text-left">
                                                <div className="mb-2">
                                                    <div className="text-[8px] font-light text-gray-800">John <strong>Doe</strong></div>
                                                    <div className="text-[5px] text-green-600 font-medium">Software Engineer</div>
                                                </div>
                                                <div className="text-[5px] text-green-600 font-bold uppercase mb-1">Experience</div>
                                                <div className="border-l-2 border-green-500 pl-1 mb-2">
                                                    <div className="text-[5px] font-bold text-gray-700">Senior Dev</div>
                                                    <div className="text-[4px] text-gray-500">Tech Corp</div>
                                                </div>
                                                <div className="flex gap-1 flex-wrap">
                                                    <span className="text-[4px] bg-green-100 text-green-700 px-1 rounded">React</span>
                                                    <span className="text-[4px] bg-green-100 text-green-700 px-1 rounded">Python</span>
                                                </div>
                                            </div>
                                        )}
                                        {template.id === 'creative' && (
                                            <div className="w-full h-full bg-white overflow-hidden">
                                                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 text-white">
                                                    <div className="text-[8px] font-bold">John Doe</div>
                                                    <div className="text-[5px] opacity-90">Software Engineer</div>
                                                </div>
                                                <div className="p-2">
                                                    <div className="flex gap-1 flex-wrap mb-1">
                                                        <span className="text-[4px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-1 rounded">React</span>
                                                        <span className="text-[4px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-1 rounded">Node</span>
                                                    </div>
                                                    <div className="text-[5px] text-purple-600 font-bold">Experience</div>
                                                    <div className="text-[4px] text-gray-600">Senior Dev at Tech Corp</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Template Info */}
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {template.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {template.description}
                                        </p>
                                    </div>

                                    {/* Selected Indicator */}
                                    {currentTemplate === template.id && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                                            ✓
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            All templates are ATS-friendly and optimized for professional use
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
