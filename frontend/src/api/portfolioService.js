/**
 * Portfolio Service
 * Handles all portfolio-related API calls
 */
import api from './axios';

export const portfolioService = {
    // Get user's portfolio
    getMyPortfolio: async () => {
        const response = await api.get('portfolio/my_portfolio/');
        return response.data;
    },

    // Update portfolio settings
    updateSettings: async (data) => {
        const response = await api.patch('portfolio/update_settings/', data);
        return response.data;
    },

    // Set custom subdomain (requires Placement Pro plan)
    setSubdomain: async (subdomain) => {
        const response = await api.post('portfolio/set_subdomain/', { subdomain });
        return response.data;
    },

    // Add project to portfolio
    addProject: async (projectId, projectType = 'roadmap') => {
        const response = await api.post('portfolio/add_project/', {
            project_id: projectId,
            project_type: projectType
        });
        return response.data;
    },

    // Remove project from portfolio
    removeProject: async (projectId, projectType = 'roadmap') => {
        const response = await api.post('portfolio/remove_project/', {
            project_id: projectId,
            project_type: projectType
        });
        return response.data;
    },

    // Get portfolio analytics (requires Career Ready or higher plan)
    getAnalytics: async () => {
        const response = await api.get('portfolio/analytics/');
        return response.data;
    },

    // Get public portfolio by slug
    getPublicBySlug: async (slug) => {
        const response = await api.get(`portfolio/public/${slug}/`);
        return response.data;
    },

    // Get public portfolio by subdomain
    getPublicBySubdomain: async (subdomain) => {
        const response = await api.get(`portfolio/subdomain/${subdomain}/`);
        return response.data;
    }
};
