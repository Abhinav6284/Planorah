import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionService } from '../../../api/subscriptionService';

const SubscriptionWidget = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const data = await subscriptionService.getMySubscription();
            setSubscription(data);
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
            setSubscription(null);
        } finally {
            setLoading(false);
        }
    };

    const getPlanIcon = (planName) => {
        const icons = {
            free: '🆓',
            starter: '🚀',
            pro: '⭐',
            enterprise: '💎'
        };
        return icons[planName?.toLowerCase()] || '📦';
    };

    const getPlanColor = (planName) => {
        const colors = {
            free: 'from-gray-500 to-gray-600',
            starter: 'from-blue-500 to-blue-600',
            pro: 'from-purple-500 to-indigo-600',
            enterprise: 'from-amber-500 to-orange-600'
        };
        return colors[planName?.toLowerCase()] || 'from-gray-500 to-gray-600';
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 h-full flex items-center justify-center border border-gray-100 dark:border-gray-800">
                <div className="text-gray-400 dark:text-gray-500 animate-pulse">Loading...</div>
            </div>
        );
    }

    const planName = subscription?.plan?.name || 'Free';
    const isActive = subscription?.is_active;
    const daysRemaining = subscription?.days_remaining || 0;

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 h-full flex flex-col relative overflow-hidden border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Subscription</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            {/* Plan Card */}
            <div className={`flex-1 bg-gradient-to-br ${getPlanColor(planName)} rounded-2xl p-4 text-white mb-4`}>
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getPlanIcon(planName)}</span>
                    <div>
                        <h4 className="text-lg font-bold capitalize">{planName} Plan</h4>
                        <p className="text-xs opacity-80">
                            {isActive && daysRemaining > 0 
                                ? `${daysRemaining} days remaining` 
                                : subscription?.end_date 
                                    ? 'Expires soon' 
                                    : 'Unlimited access'}
                        </p>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="space-y-1.5">
                    {subscription?.plan?.features?.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="opacity-90 truncate">{feature}</span>
                        </div>
                    )) || (
                        <>
                            <div className="flex items-center gap-2 text-xs">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="opacity-90">Basic features included</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Link
                    to="/subscription"
                    className="flex-1 text-center py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    Manage
                </Link>
                {planName.toLowerCase() !== 'enterprise' && (
                    <Link
                        to="/pricing"
                        className="flex-1 text-center py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Upgrade
                    </Link>
                )}
            </div>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        </div>
    );
};

export default SubscriptionWidget;
