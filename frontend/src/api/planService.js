/**
 * Plans Service
 * Handles all subscription plan API calls
 */
import api from './axios';

export const planService = {
    // Get all available plans
    getAll: async () => {
        const response = await api.get('/api/plans/');
        return response.data;
    },

    // Get plan by ID
    getById: async (planId) => {
        const response = await api.get(`/api/plans/${planId}/`);
        return response.data;
    },

    // Get plans comparison view
    getComparison: async () => {
        const response = await api.get('/api/plans/compare/');
        return response.data;
    }
};
