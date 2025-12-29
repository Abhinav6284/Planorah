/**
 * Portfolio Service
 * Handles all portfolio-related API calls
 */
import api from './axios';

export const portfolioService = {
    // Get user's portfolio
    getMyPortfolio: async () => {
        const response = await api.get('/api/portfolio/my_portfolio/');
        return response.data;
    },

    // Update portfolio settings
    updateSettings: async (data) => {
        const response = await api.patch('/api/portfolio/update_settings/', data);
        return response.data;
    },

    // Set custom subdomain (requires Placement Pro plan)
    setSubdomain: async (subdomain) => {
        const response = await api.post('/api/portfolio/set_subdomain/', { subdomain });
        return response.data;
    },

    // Add project to portfolio
    addProject: async (projectId) => {
        const response = await api.post('/api/portfolio/add_project/', { project_id: projectId });
        return response.data;
    },

    // Remove project from portfolio
    removeProject: async (projectId) => {
        const response = await api.post('/api/portfolio/remove_project/', { project_id: projectId });
        return response.data;
    },

    // Get portfolio analytics (requires Career Ready or higher plan)
    getAnalytics: async () => {
        const response = await api.get('/api/portfolio/analytics/');
        return response.data;
    },

    // Get public portfolio by slug
    getPublicBySlug: async (slug) => {
        const response = await api.get(`/api/portfolio/public/${slug}/`);
        return response.data;
    },

    // Get public portfolio by subdomain
    getPublicBySubdomain: async (subdomain) => {
        const response = await api.get(`/api/portfolio/subdomain/${subdomain}/`);
        return response.data;
    }
};
