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
        resume_full: false,
        job_finder_unlimited: false,
        quicky_ai_daily_limit: 5,
        has_project_management: false,
        ats_scan_limit: 0,
        ats_rate_limit_per_day: 0,
        has_resources_hub: false,
        has_portfolio_live: false,
        portfolio_addon_price_inr: 0,
        sessions_per_month: 0,
        session_duration_minutes: 0,
        has_priority_booking: false,
        has_async_support: false,
        has_early_access: false,
        is_active: true,
    },
    {
        id: 'starter',
        name: 'starter',
        display_name: 'Starter',
        price_inr: 99,
        validity_days: 30,
        roadmap_limit: 5,
        resume_full: true,
        job_finder_unlimited: true,
        quicky_ai_daily_limit: -1,
        has_project_management: true,
        ats_scan_limit: 0,
        ats_rate_limit_per_day: 0,
        has_resources_hub: false,
        has_portfolio_live: true,
        portfolio_addon_price_inr: 79,
        sessions_per_month: 0,
        session_duration_minutes: 0,
        has_priority_booking: false,
        has_async_support: false,
        has_early_access: false,
        is_active: true,
    },
    {
        id: 'pro',
        name: 'pro',
        display_name: 'Pro',
        price_inr: 249,
        validity_days: 30,
        roadmap_limit: 15,
        resume_full: true,
        job_finder_unlimited: true,
        quicky_ai_daily_limit: -1,
        has_project_management: true,
        ats_scan_limit: -1,
        ats_rate_limit_per_day: 0,
        has_resources_hub: true,
        has_portfolio_live: true,
        portfolio_addon_price_inr: 0,
        sessions_per_month: 5,
        session_duration_minutes: 30,
        has_priority_booking: false,
        has_async_support: false,
        has_early_access: false,
        is_active: true,
    },
    {
        id: 'elite',
        name: 'elite',
        display_name: 'Elite',
        price_inr: 499,
        validity_days: 30,
        roadmap_limit: -1,
        resume_full: true,
        job_finder_unlimited: true,
        quicky_ai_daily_limit: -1,
        has_project_management: true,
        ats_scan_limit: -1,
        ats_rate_limit_per_day: 0,
        has_resources_hub: true,
        has_portfolio_live: true,
        portfolio_addon_price_inr: 0,
        sessions_per_month: 10,
        session_duration_minutes: 45,
        has_priority_booking: true,
        has_async_support: true,
        has_early_access: true,
        is_active: true,
    },
    {
        id: 'starter_yearly',
        name: 'starter_yearly',
        display_name: 'Starter',
        price_inr: 1089,
        validity_days: 365,
        roadmap_limit: 5,
        resume_full: true,
        job_finder_unlimited: true,
        quicky_ai_daily_limit: -1,
        has_project_management: true,
        ats_scan_limit: 0,
        ats_rate_limit_per_day: 0,
        has_resources_hub: false,
        has_portfolio_live: true,
        portfolio_addon_price_inr: 79,
        sessions_per_month: 0,
        session_duration_minutes: 0,
        has_priority_booking: false,
        has_async_support: false,
        has_early_access: false,
        is_active: true,
    },
    {
        id: 'pro_yearly',
        name: 'pro_yearly',
        display_name: 'Pro',
        price_inr: 2400,
        validity_days: 365,
        roadmap_limit: 15,
        resume_full: true,
        job_finder_unlimited: true,
        quicky_ai_daily_limit: -1,
        has_project_management: true,
        ats_scan_limit: -1,
        ats_rate_limit_per_day: 0,
        has_resources_hub: true,
        has_portfolio_live: true,
        portfolio_addon_price_inr: 0,
        sessions_per_month: 5,
        session_duration_minutes: 30,
        has_priority_booking: false,
        has_async_support: false,
        has_early_access: false,
        is_active: true,
    },
    {
        id: 'elite_yearly',
        name: 'elite_yearly',
        display_name: 'Elite',
        price_inr: 5148,
        validity_days: 365,
        roadmap_limit: -1,
        resume_full: true,
        job_finder_unlimited: true,
        quicky_ai_daily_limit: -1,
        has_project_management: true,
        ats_scan_limit: -1,
        ats_rate_limit_per_day: 0,
        has_resources_hub: true,
        has_portfolio_live: true,
        portfolio_addon_price_inr: 0,
        sessions_per_month: 10,
        session_duration_minutes: 45,
        has_priority_booking: true,
        has_async_support: true,
        has_early_access: true,
        is_active: true,
    },
];

const PLAN_TIER = { free: 0, starter: 1, starter_yearly: 1, pro: 2, pro_yearly: 2, elite: 3, elite_yearly: 3 };

const getPlanTier = (p) => {
    if (!p) return -1;
    const byName = PLAN_TIER[String(p.name || p.display_name || '').toLowerCase()];
    if (byName != null) return byName;
    return Number(p.price_inr ?? -1);
};

const PlanCard = ({ plan, currentPlan, onSelect, isPopular }) => {
    const isCurrentPlan = currentPlan?.plan === plan.id || currentPlan?.plan_details?.name === plan.name;
    const thisTier = getPlanTier(plan);
    const currentTier = getPlanTier(currentPlan?.plan_details);
    const hasCurrentPlan = currentTier !== -1;
    const isUpgrade = hasCurrentPlan && !isCurrentPlan && thisTier > currentTier;
    const isDowngrade = hasCurrentPlan && !isCurrentPlan && thisTier < currentTier;
    const isYearly = plan.name.endsWith('_yearly');

    const buttonLabel = isCurrentPlan
        ? 'Current Plan'
        : isUpgrade
            ? 'Upgrade Plan'
            : isDowngrade
                ? 'Downgrade Plan'
                : 'Select Plan';

    const monthlyEquivalent = isYearly ? Math.round(plan.price_inr / 12) : null;

    const getFeaturesList = (plan) => {
        const features = [];
        if (plan.roadmap_limit === -1) {
            features.push('Unlimited Career Roadmaps');
        } else {
            features.push(`${plan.roadmap_limit} Career Roadmaps`);
        }
        features.push(plan.resume_full ? 'Full Resume Builder' : 'Basic Resume Builder');
        features.push(plan.job_finder_unlimited ? 'Job Finder (unlimited)' : 'Job Finder (limited)');
        features.push(plan.quicky_ai_daily_limit === -1 ? 'Unlimited AI Queries' : `${plan.quicky_ai_daily_limit} AI Queries/day`);
        features.push(plan.has_project_management ? 'Task & Project Management' : 'Task Management (basic)');
        if (plan.ats_scan_limit === -1) features.push('ATS Scanner (unlimited)');
        else if (plan.ats_scan_limit > 0) features.push(`${plan.ats_scan_limit} ATS scans`);
        if (plan.has_resources_hub) features.push('Resources Hub (50+ tools)');
        if (plan.has_portfolio_live && Number(plan.portfolio_addon_price_inr) > 0) {
            features.push(`Portfolio Live (addon ₹${plan.portfolio_addon_price_inr})`);
        } else if (plan.has_portfolio_live) {
            features.push('Portfolio Live (included)');
        }
        if ((plan.sessions_per_month ?? 0) > 0) {
            features.push(`${plan.sessions_per_month} × 1:1 Sessions/mo (${plan.session_duration_minutes} min)`);
        }
        if (plan.has_priority_booking) features.push('Priority Booking');
        if (plan.has_async_support) features.push('Async Support (WhatsApp/Discord)');
        if (plan.has_early_access) features.push('Early Access to New Features');
        return features;
    };

    const cardStyle = {
        position: 'relative',
        background: isPopular ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: isPopular ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px',
        padding: '24px 20px',
        boxShadow: isPopular
            ? '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            style={cardStyle}
        >
            {isPopular && (
                <div style={{
                    position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                    background: 'white', color: '#0a0a0a', fontSize: '11px', fontWeight: 700,
                    padding: '3px 14px', borderRadius: '999px', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                }}>
                    MOST POPULAR
                </div>
            )}
            {isCurrentPlan && (
                <div style={{
                    position: 'absolute', top: '-11px', right: '16px',
                    background: '#22c55e', color: '#0a0a0a', fontSize: '11px', fontWeight: 700,
                    padding: '3px 12px', borderRadius: '999px', whiteSpace: 'nowrap',
                }}>
                    Current Plan
                </div>
            )}

            {/* Plan name */}
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
                {plan.display_name}
            </div>

            {/* Price */}
            {isYearly ? (
                <>
                    <div style={{ fontSize: '38px', fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>
                        ₹{monthlyEquivalent}<span style={{ fontSize: '15px', fontWeight: 400, color: '#52525b' }}>/mo</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#3f3f46', marginTop: '4px', marginBottom: '20px' }}>
                        billed annually · ₹{plan.price_inr.toLocaleString('en-IN')}/year
                    </div>
                </>
            ) : (
                <>
                    <div style={{ fontSize: '38px', fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>
                        {plan.price_inr === 0 ? '₹0' : `₹${plan.price_inr}`}
                        <span style={{ fontSize: '15px', fontWeight: 400, color: '#52525b' }}>
                            {plan.price_inr === 0 ? '' : '/mo'}
                        </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#3f3f46', marginTop: '4px', marginBottom: '20px' }}>
                        {plan.price_inr === 0 ? 'forever' : 'per month'}
                    </div>
                </>
            )}

            {/* CTA Button */}
            <button
                onClick={() => onSelect(plan)}
                disabled={isCurrentPlan}
                style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isCurrentPlan ? 'default' : 'pointer',
                    border: 'none',
                    marginBottom: '20px',
                    transition: 'opacity 0.2s',
                    ...(isCurrentPlan
                        ? { background: 'rgba(255,255,255,0.04)', color: '#52525b', border: '1px solid rgba(255,255,255,0.08)' }
                        : isPopular
                            ? { background: 'white', color: '#0a0a0a' }
                            : { background: 'rgba(255,255,255,0.08)', color: '#d4d4d8', border: '1px solid rgba(255,255,255,0.1)' }
                    ),
                }}
            >
                {buttonLabel}
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }} />

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {getFeaturesList(plan).map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#a1a1aa', lineHeight: 1.4 }}>
                        <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                        {feature}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default function PricingPage() {
    const navigate = useNavigate();
    const [allPlans, setAllPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [billingPeriod, setBillingPeriod] = useState('monthly');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchData(); }, []);

    const normalizePlans = (plansData) => {
        if (Array.isArray(plansData) && plansData.length > 0) return plansData;
        if (Array.isArray(plansData?.results) && plansData.results.length > 0) return plansData.results;
        return FALLBACK_PLANS;
    };

    const fetchData = async () => {
        try {
            const [plansData, subscriptionData] = await Promise.all([
                planService.getAll(),
                subscriptionService.getCurrent().catch(() => null)
            ]);
            setAllPlans(normalizePlans(plansData));
            setCurrentSubscription(subscriptionData);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            setAllPlans(FALLBACK_PLANS);
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

    const displayedPlans = allPlans.filter((p) =>
        billingPeriod === 'yearly'
            ? p.name === 'free' || p.name.endsWith('_yearly')
            : !p.name.endsWith('_yearly')
    );

    const isPopularPlan = (plan) =>
        plan.name === 'pro' || plan.name === 'pro_yearly';

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#52525b' }}>Loading plans...</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050505', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif', paddingBottom: '80px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                        Plans &amp; Pricing
                    </h1>
                    <p style={{ fontSize: '15px', color: '#71717a', maxWidth: '480px', margin: '0 auto' }}>
                        Choose the best plan for your professional needs.
                    </p>
                </motion.div>

                {/* Current plan banner */}
                {currentSubscription && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', marginBottom: '28px', backdropFilter: 'blur(12px)',
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '13px', color: '#71717a' }}>You're currently on</div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>
                                {currentSubscription.plan_details?.display_name} Plan
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/subscription')}
                            style={{
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                color: '#d4d4d8', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                            }}
                        >
                            View Details
                        </button>
                    </motion.div>
                )}

                {/* Billing toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '36px' }}>
                    <div style={{
                        display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '999px', padding: '4px', gap: '2px',
                    }}>
                        {['monthly', 'yearly'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setBillingPeriod(period)}
                                style={{
                                    padding: '7px 20px', borderRadius: '999px', fontSize: '14px', border: 'none', cursor: 'pointer',
                                    fontWeight: billingPeriod === period ? 600 : 500,
                                    background: billingPeriod === period ? 'white' : 'transparent',
                                    color: billingPeriod === period ? '#0a0a0a' : '#71717a',
                                    transition: 'all 0.2s',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                    {billingPeriod === 'yearly' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            style={{
                                background: 'rgba(34,197,94,0.12)', color: '#22c55e',
                                border: '1px solid rgba(34,197,94,0.2)', fontSize: '12px',
                                fontWeight: 600, padding: '4px 10px', borderRadius: '999px',
                            }}
                        >
                            1 month free
                        </motion.div>
                    )}
                </div>

                {/* Plan cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '48px' }}>
                    {displayedPlans.map((plan) => (
                        <PlanCard
                            key={plan.id || plan.name}
                            plan={plan}
                            currentPlan={currentSubscription}
                            onSelect={handleSelectPlan}
                            isPopular={isPopularPlan(plan)}
                        />
                    ))}
                </div>

                {/* All plans include */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '18px', padding: '32px', backdropFilter: 'blur(12px)', marginBottom: '24px',
                    }}
                >
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: '24px' }}>
                        All Plans Include
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {[
                            { icon: '🎯', title: 'Goal-Based Roadmaps', desc: 'Structured learning paths tailored to your career goals' },
                            { icon: '📅', title: 'Calendar Scheduling', desc: 'Schedule tasks and track your daily progress' },
                            { icon: '🚀', title: 'Project Building', desc: 'Build real projects to showcase your skills' },
                            { icon: '📝', title: 'Resume Builder', desc: 'Create ATS-optimized resumes' },
                            { icon: '🔍', title: 'ATS Scanner', desc: 'Check your resume compatibility' },
                            { icon: '🌐', title: 'Live Portfolio', desc: 'Hosted portfolio while subscribed' },
                        ].map((feature, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '2px' }}>{feature.title}</div>
                                    <div style={{ fontSize: '12px', color: '#52525b' }}>{feature.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    style={{ textAlign: 'center', fontSize: '12px', color: '#3f3f46' }}
                >
                    Portfolio stays live only while your subscription is active.
                    After expiry, it enters read-only mode showing only your name and project titles.
                </motion.p>

            </div>
        </div>
    );
}
