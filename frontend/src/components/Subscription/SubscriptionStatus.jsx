import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../api/subscriptionService';

const UsageMeter = ({ used, limit, label }) => {
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
    const isNearLimit = percentage > 80;
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                <span className={`font-medium ${isNearLimit ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {isUnlimited ? 'Unlimited' : `${used} / ${limit}`}
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isUnlimited ? '0%' : `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-2 rounded-full ${isNearLimit ? 'bg-red-500' : 'bg-gray-900 dark:bg-white'}`}
                />
            </div>
        </div>
    );
};

export default function SubscriptionStatus() {
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState(null);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const [subData, usageData] = await Promise.all([
                subscriptionService.getCurrent(),
                subscriptionService.getUsage()
            ]);
            setSubscription(subData);
            setUsage(usageData);
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'grace': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Loading subscription...</div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 font-sans pb-20">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center"
                    >
                        <div className="text-5xl mb-4">📋</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            No Active Subscription
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Get started with a plan to unlock roadmaps, projects, resume builder, and more.
                        </p>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-all"
                        >
                            View Plans
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 font-sans pb-20">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Subscription
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage your plan and view usage
                    </p>
                </motion.div>

                {/* Status Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {subscription.plan_details?.display_name}
                                </h2>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">
                                ₹{subscription.plan_details?.price_inr} • {subscription.plan_details?.validity_days} days plan
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                {subscription.days_remaining}
                            </div>
                            <div className="text-sm text-gray-500">days remaining</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Started {new Date(subscription.start_date).toLocaleDateString()}</span>
                            <span>Expires {new Date(subscription.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(0, 100 - (subscription.days_remaining / subscription.plan_details?.validity_days) * 100)}%` }}
                                className="h-2 rounded-full bg-gray-900 dark:bg-white"
                            />
                        </div>
                    </div>

                    {/* Warning for expiring soon */}
                    {subscription.days_remaining <= 7 && subscription.status === 'active' && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                ⚠️ Your subscription expires in {subscription.days_remaining} days. Renew now to avoid losing access.
                            </p>
                        </div>
                    )}

                    {subscription.status === 'grace' && subscription.grace_end_date && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                ⚠️ Your subscription has expired. You're in a grace period until {new Date(subscription.grace_end_date).toLocaleDateString()}. 
                                Renew now to continue creating content.
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Usage Section */}
                {usage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Usage</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <UsageMeter 
                                used={usage.roadmaps_used} 
                                limit={usage.roadmap_limit} 
                                label="Roadmaps" 
                            />
                            <UsageMeter 
                                used={usage.projects_used} 
                                limit={usage.project_limit} 
                                label="Projects" 
                            />
                            <UsageMeter 
                                used={usage.resumes_used} 
                                limit={usage.resume_limit} 
                                label="Resumes" 
                            />
                            <UsageMeter 
                                used={usage.ats_scans_used} 
                                limit={usage.ats_scan_limit} 
                                label="ATS Scans" 
                            />
                        </div>
                    </motion.div>
                )}

                {/* Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <button
                        onClick={() => navigate('/pricing')}
                        className="flex-1 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-all text-center"
                    >
                        {subscription.status === 'active' ? 'Upgrade Plan' : 'Renew Subscription'}
                    </button>
                    <button
                        onClick={() => navigate('/billing/history')}
                        className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-center"
                    >
                        Billing History
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
