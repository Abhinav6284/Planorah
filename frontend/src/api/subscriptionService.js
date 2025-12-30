/**
 * Subscription Service
 * Handles all subscription-related API calls
 */
import api from './axios';

export const subscriptionService = {
    // Get current active subscription
    getCurrent: async () => {
        const response = await api.get('/api/subscriptions/current/');
        return response.data;
    },

    // Get subscription usage details
    getUsage: async () => {
        const response = await api.get('/api/subscriptions/usage/');
        return response.data;
    },

    // Activate a new subscription
    activate: async (planId, paymentId = '') => {
        const response = await api.post('/api/subscriptions/activate/', {
            plan_id: planId,
            payment_id: paymentId
        });
        return response.data;
    },

    // Renew an expired subscription
    renew: async (planId, paymentId = '') => {
        const response = await api.post('/api/subscriptions/renew/', {
            plan_id: planId,
            payment_id: paymentId
        });
        return response.data;
    },

    // Cancel subscription
    cancel: async (subscriptionId) => {
        const response = await api.post(`/api/subscriptions/${subscriptionId}/cancel/`);
        return response.data;
    },

    // Check expiry status
    checkExpiry: async () => {
        const response = await api.get('/api/subscriptions/check_expiry/');
        return response.data;
    },

    // Get subscription history
    getHistory: async () => {
        const response = await api.get('/api/subscriptions/');
        return response.data;
    }
};
