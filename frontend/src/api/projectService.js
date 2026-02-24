/**
 * Project Service
 * Handles all student project-related API calls
 */
import api from './axios';

export const projectService = {
    // Get all student projects
    list: async () => {
        const response = await api.get('roadmap/student-projects/');
        return response.data;
    },

    // Get a single project
    get: async (id) => {
        const response = await api.get(`roadmap/student-projects/${id}/`);
        return response.data;
    },

    // Create a new project
    create: async (data) => {
        const response = await api.post('roadmap/student-projects/', data);
        return response.data;
    },

    // Update a project
    update: async (id, data) => {
        const response = await api.patch(`roadmap/student-projects/${id}/`, data);
        return response.data;
    },

    // Delete a project
    delete: async (id) => {
        await api.delete(`roadmap/student-projects/${id}/`);
    },

    // Get project statistics
    getStats: async () => {
        const response = await api.get('roadmap/student-projects/stats/');
        return response.data;
    }
};
