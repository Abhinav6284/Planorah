import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ToolsWidget({ stats }) {
    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            <Link to="/resume" className="block h-full">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-full flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-2xl">📄</div>
                        {stats?.resumes_created > 0 && (
                            <span className="bg-gray-100 dark:bg-gray-700 font-bold px-2 py-1 rounded-lg text-xs">
                                {stats.resumes_created} Created
                            </span>
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Resume Builder</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered resume creation</p>
                    </div>
                </motion.div>
            </Link>

            <Link to="/ats" className="block h-full">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-full flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-2xl">🎯</div>
                        {stats?.ats_scans > 0 && (
                            <span className={`font-bold px-2 py-1 rounded-lg text-xs ${stats.latest_ats_score >= 80 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                Score: {stats.latest_ats_score}%
                            </span>
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">ATS Scanner</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Analyze job fit score</p>
                    </div>
                </motion.div>
            </Link>
        </div>
    );
}
