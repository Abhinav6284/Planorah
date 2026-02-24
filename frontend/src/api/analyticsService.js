/**
 * Analytics Service
 * Handles progress tracking and analytics API calls
 */
import api from './axios';

export const analyticsService = {
    // Get dashboard statistics
    getDashboard: async () => {
        const response = await api.get('analytics/dashboard/');
        return response.data;
    },

    // Get overall user progress
    getProgress: async () => {
        const response = await api.get('analytics/progress/');
        return response.data;
    },

    // Get all roadmap progress
    getRoadmapProgress: async () => {
        const response = await api.get('analytics/roadmaps/');
        return response.data;
    },

    // Get activity chart data
    getActivityChart: async (days = 30) => {
        const response = await api.get('analytics/activity_chart/', {
            params: { days }
        });
        return response.data;
    },

    // Get usage logs
    getUsageLogs: async (limit = 50) => {
        const response = await api.get('analytics/usage_logs/', {
            params: { limit }
        });
        return response.data;
    },

    // Log user activity
    logActivity: async (action, resourceType = '', resourceId = null) => {
        const data = { action };
        if (resourceType) {
            data.resource_type = resourceType;
        }
        if (resourceId) {
            data.resource_id = resourceId;
        }
        const response = await api.post('analytics/log_activity/', data);
        return response.data;
    }
};
