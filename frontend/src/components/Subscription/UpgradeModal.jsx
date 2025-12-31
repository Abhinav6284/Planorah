import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const featureMessages = {
    create_roadmap: {
        title: 'Roadmap Limit Reached',
        message: 'You have used all your roadmaps for this plan.',
        icon: '🗺️'
    },
    create_project: {
        title: 'Project Limit Reached',
        message: 'You have used all your projects for this plan.',
        icon: '💼'
    },
    create_resume: {
        title: 'Resume Limit Reached',
        message: 'You have used all your resume slots for this plan.',
        icon: '📝'
    },
    ats_scan: {
        title: 'ATS Scan Limit Reached',
        message: 'You have used all your ATS scans. Rate-limited plans reset daily.',
        icon: '🔍'
    },
    portfolio_analytics: {
        title: 'Feature Unavailable',
        message: 'Portfolio analytics is available with Career Ready and above plans.',
        icon: '📊'
    },
    custom_subdomain: {
        title: 'Feature Unavailable',
        message: 'Custom subdomain is available with the Placement Pro plan.',
        icon: '🌐'
    },
    no_subscription: {
        title: 'Subscription Required',
        message: 'You need an active subscription to access this feature.',
        icon: '📋'
    }
};

export default function UpgradeModal({ feature, isOpen, onClose }) {
    const navigate = useNavigate();
    const featureInfo = featureMessages[feature] || featureMessages.no_subscription;

    const handleUpgrade = () => {
        onClose();
        navigate('/pricing');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 text-center">
                            <div className="text-5xl mb-4">{featureInfo.icon}</div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {featureInfo.title}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                {featureInfo.message}
                            </p>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={handleUpgrade}
                                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-all"
                                >
                                    View Plans
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
