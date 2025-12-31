import api from "../api";

export const roadmapService = {
    // Generate a new roadmap
    generateRoadmap: async (data) => {
        const response = await api.post("roadmap/generate/", data);
        return response.data;
    },

    // Get all roadmaps for the user
    getUserRoadmaps: async () => {
        const response = await api.get("roadmap/list/");
        return response.data;
    },

    // Get a specific roadmap detail
    getRoadmapDetail: async (id) => {
        const response = await api.get(`roadmap/${id}/`);
        return response.data;
    },

    // Delete a roadmap
    deleteRoadmap: async (id) => {
        const response = await api.delete(`roadmap/${id}/delete/`);
        return response.data;
    },

    // Update milestone progress
    updateMilestoneProgress: async (milestoneId, completed) => {
        const response = await api.patch(`roadmap/milestone/${milestoneId}/progress/`, {
            completed,
        });
        return response.data;
    },

    // Schedule a roadmap
    scheduleRoadmap: async (id, startDate) => {
        const response = await api.post(`roadmap/${id}/schedule/`, {
            start_date: startDate,
        });
        return response.data;
    },

    // Get all roadmap projects (for Projects tab)
    getRoadmapProjects: async () => {
        const response = await api.get("roadmap/projects/");
        return response.data;
    },

    // Get progress for all roadmaps
    getRoadmapProgress: async () => {
        const response = await api.get("roadmap/progress/");
        return response.data;
    },
};
