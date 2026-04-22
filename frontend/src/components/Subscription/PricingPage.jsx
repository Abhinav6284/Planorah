import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { planService } from '../../api/planService';
import { subscriptionService } from '../../api/subscriptionService';

const FALLBACK_PLANS = [
    {
        id: 'free',
        name: 'free',
        display_name: 'Free',
        price_inr: 0,
        validity_days: 36500,
        roadmap_limit: 1,
        is_short_roadmap: true,
        project_limit_min: 1,
        project_limit_max: 1,
        resume_limit: 1,
        ats_scan_limit: 1,
        ats_rate_limit_per_day: 1,
        portfolio_analytics: false,
        custom_subdomain: false,
        is_active: true,
    },
    {
        id: 'starter',
        name: 'starter',
        display_name: 'Starter',
        price_inr: 99,
        validity_days: 30,
        roadmap_limit: 5,
        is_short_roadmap: false,
        project_limit_min: 2,
        project_limit_max: 3,
        resume_limit: 2,
        ats_scan_limit: 0,
        ats_rate_limit_per_day: 0,
        portfolio_analytics: false,
        custom_subdomain: false,
        is_active: true,
    },
    {
        id: 'pro',
        name: 'pro',
        display_name: 'Pro',
        price_inr: 249,
        validity_days: 30,
        roadmap_limit: 15,
        is_short_roadmap: false,
        project_limit_min: 4,
        project_limit_max: 5,
        resume_limit: -1,
        ats_scan_limit: -1,
        ats_rate_limit_per_day: 0,
        portfolio_analytics: true,
        custom_subdomain: false,
        is_active: true,
    },
    {
        id: 'elite',
        name: 'elite',
        display_name: 'Elite',
        price_inr: 499,
        validity_days: 30,
        roadmap_limit: -1,
        is_short_roadmap: false,
        project_limit_min: 6,
        project_limit_max: 8,
        resume_limit: -1,
        ats_scan_limit: -1,
        ats_rate_limit_per_day: 0,
        portfolio_analytics: true,
        custom_subdomain: true,
        is_active: true,
    },
];

const PlanCard = ({ plan, currentPlan, onSelect, isPopular }) => {
    const isCurrentPlan = currentPlan?.plan === plan.id;
    
    const getFeaturesList = (plan) => {
        const features = [];
        
        // Roadmaps
        const roadmapText = plan.is_short_roadmap 
            ? `${plan.roadmap_limit} short roadmap` 
            : `${plan.roadmap_limit} full roadmap${plan.roadmap_limit > 1 ? 's' : ''}`;
        features.push(roadmapText);
        
        // Projects
        if (plan.project_limit_min === plan.project_limit_max) {
            features.push(`${plan.project_limit_min} project${plan.project_limit_min > 1 ? 's' : ''}`);
        } else {
            features.push(`${plan.project_limit_min}-${plan.project_limit_max} projects`);
        }
        
        // Resume
        if (plan.resume_limit === -1) {
            features.push('Unlimited resume edits');
        } else {
            features.push(`${plan.resume_limit} resume${plan.resume_limit > 1 ? 's' : ''}`);
        }
        
        // ATS
        if (plan.ats_scan_limit === -1) {
            features.push(`Unlimited ATS scans (${plan.ats_rate_limit_per_day}/day)`);
        } else {
            features.push(`${plan.ats_scan_limit} ATS scan${plan.ats_scan_limit > 1 ? 's' : ''}`);
        }
        
        // Portfolio
        features.push('Portfolio hosting');
        if (plan.portfolio_analytics) {
            features.push('Portfolio analytics');
        }
        if (plan.custom_subdomain) {
            features.push('Custom subdomain');
        }
        
        return features;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative bg-white dark:bg-[#1a1a1a] border ${isPopular ? 'border-gray-900 dark:border-white' : 'border-gray-200 dark:border-charcoalMuted'} rounded-2xl p-6 ${isPopular ? 'ring-2 ring-gray-900 dark:ring-white' : ''}`}
        >
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-full">
                    Most Popular
                </div>
            )}
            
            {isCurrentPlan && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    Current Plan
                </div>
            )}
            
            <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {plan.display_name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{plan.price_inr}</span>
                    <span className="text-gray-500 text-sm">/ {plan.validity_days} days</span>
                </div>
            </div>
            
            <div className="space-y-3 mb-6">
                {getFeaturesList(plan).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                    </div>
                ))}
            </div>
            
            <button
                onClick={() => onSelect(plan)}
                disabled={isCurrentPlan}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    isCurrentPlan 
                        ? 'bg-gray-100 dark:bg-charcoal text-gray-400 cursor-not-allowed'
                        : isPopular
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90'
                            : 'border-0 shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-charcoalDark'
                }`}
            >
                {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
            </button>
        </motion.div>
    );
};

export default function PricingPage() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const normalizePlans = (plansData) => {
        if (Array.isArray(plansData) && plansData.length > 0) {
            return plansData;
        }

        if (Array.isArray(plansData?.results) && plansData.results.length > 0) {
            return plansData.results;
        }

        return FALLBACK_PLANS;
    };

    const fetchData = async () => {
        try {
            const [plansData, subscriptionData] = await Promise.all([
                planService.getAll(),
                subscriptionService.getCurrent().catch(() => null)
            ]);
            setPlans(normalizePlans(plansData));
            setCurrentSubscription(subscriptionData);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            setPlans(FALLBACK_PLANS);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        if (!plan?.id || typeof plan.id !== 'number') {
            navigate('/register');
            return;
        }

        navigate('/billing/checkout', { state: { plan } });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Loading plans...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 font-sans pb-20">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Choose Your Plan
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Get access to roadmaps, projects, resume builder, ATS scanner, and a live portfolio.
                        All plans include subscription-based portfolio hosting.
                    </p>
                </motion.div>

                {/* Current Subscription Banner */}
                {currentSubscription && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-white dark:bg-[#1a1a1a] border-0 shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-2xl"
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Current Plan: {currentSubscription.plan_details?.display_name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {currentSubscription.days_remaining} days remaining • 
                                    Status: <span className={`font-medium ${currentSubscription.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {currentSubscription.status}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/subscription')}
                                className="px-4 py-2 text-sm border-0 shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-charcoalDark transition-colors"
                            >
                                View Details
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, index) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            currentPlan={currentSubscription}
                            onSelect={handleSelectPlan}
                            isPopular={plan.name === 'career_ready'}
                        />
                    ))}
                </div>

                {/* Features Comparison */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 bg-white dark:bg-[#1a1a1a] border-0 shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-2xl p-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        All Plans Include
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: '🎯', title: 'Goal-Based Roadmaps', desc: 'Structured learning paths tailored to your career goals' },
                            { icon: '📅', title: 'Calendar Scheduling', desc: 'Schedule tasks and track your daily progress' },
                            { icon: '🚀', title: 'Project Building', desc: 'Build real projects to showcase your skills' },
                            { icon: '📝', title: 'Resume Builder', desc: 'Create ATS-optimized resumes' },
                            { icon: '🔍', title: 'ATS Scanner', desc: 'Check your resume compatibility' },
                            { icon: '🌐', title: 'Live Portfolio', desc: 'Hosted portfolio while subscribed' },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="text-2xl">{feature.icon}</span>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{feature.title}</h4>
                                    <p className="text-xs text-gray-500">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 text-center"
                >
                    <p className="text-sm text-gray-500">
                        Portfolio stays live only while your subscription is active. 
                        After expiry, it enters read-only mode showing only your name and project titles.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
