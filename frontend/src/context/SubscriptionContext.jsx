import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscriptionService } from '../api/subscriptionService';

const SubscriptionContext = createContext();

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within SubscriptionProvider');
    }
    return context;
};

export const SubscriptionProvider = ({ children }) => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadSubscription = async () => {
        try {
            setLoading(true);
            const data = await subscriptionService.getCurrent();
            setSubscription(data);
            setError(null);
        } catch (err) {
            setSubscription(null);
            // 404 is expected when no subscription exists
            if (err.response?.status !== 404) {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only load if user is authenticated
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (token) {
            loadSubscription();
        } else {
            setLoading(false);
        }
    }, []);

    const canAccess = (feature) => {
        if (!subscription) return false;
        if (subscription.status !== 'active') return false;

        switch (feature) {
            case 'create_roadmap':
                return subscription.roadmaps_used < subscription.plan_details?.roadmap_limit;
            case 'create_project':
                return subscription.projects_used < subscription.plan_details?.project_limit_max;
            case 'create_resume':
                return subscription.plan_details?.resume_limit === -1 || 
                       subscription.resumes_used < subscription.plan_details?.resume_limit;
            case 'ats_scan':
                return subscription.plan_details?.ats_scan_limit === -1 || 
                       subscription.ats_scans_used < subscription.plan_details?.ats_scan_limit;
            case 'portfolio_analytics':
                return subscription.plan_details?.portfolio_analytics;
            case 'custom_subdomain':
                return subscription.plan_details?.custom_subdomain;
            default:
                return true;
        }
    };

    const isActive = () => {
        return subscription && subscription.status === 'active';
    };

    const isInGrace = () => {
        return subscription && subscription.status === 'grace';
    };

    const hasSubscription = () => {
        return subscription !== null;
    };

    return (
        <SubscriptionContext.Provider value={{
            subscription,
            loading,
            error,
            canAccess,
            isActive,
            isInGrace,
            hasSubscription,
            refresh: loadSubscription
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
