/**
 * Subscription Service
 * Handles all subscription-related API calls
 */
import api from './axios';

export const subscriptionService = {
    // Get current active subscription (alias for widget compatibility)
    getMySubscription: async () => {
        const response = await api.get('subscriptions/current/');
        const data = response.data;
        return data?.status === 'none' ? null : data;
    },

    // Get current active subscription
    getCurrent: async () => {
        const response = await api.get('subscriptions/current/');
        const data = response.data;
        return data?.status === 'none' ? null : data;
    },

    // Get subscription usage details
    getUsage: async () => {
        try {
            const response = await api.get('subscriptions/usage/');
            return response.data;
        } catch (error) {
            // Backend returns 404 when no active subscription; treat as no-usage state.
            if (error?.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    // Activate a new subscription
    activate: async (planId, paymentId = '') => {
        const response = await api.post('subscriptions/activate/', {
            plan_id: planId,
            payment_id: paymentId
        });
        return response.data;
    },

    // Renew an expired subscription
    renew: async (planId, paymentId = '') => {
        const response = await api.post('subscriptions/renew/', {
            plan_id: planId,
            payment_id: paymentId
        });
        return response.data;
    },

    // Cancel subscription
    cancel: async (subscriptionId) => {
        const response = await api.post(`subscriptions/${subscriptionId}/cancel/`);
        return response.data;
    },

    // Check expiry status
    checkExpiry: async () => {
        const response = await api.get('subscriptions/check_expiry/');
        return response.data;
    },

    // Get subscription history
    getHistory: async () => {
        const response = await api.get('subscriptions/');
        return response.data;
    }
};
