import api from "../api";

const ROADMAP_GENERATION_TIMEOUT_MS = 120000;

const normalizeArrayPayload = (payload, keys = []) => {
    if (Array.isArray(payload)) return payload;
    for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
    }
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
};

export const roadmapService = {
    // Generate a new roadmap
    generateRoadmap: async (data) => {
        const response = await api.post("roadmap/generate/", data, {
            timeout: ROADMAP_GENERATION_TIMEOUT_MS,
        });
        return response.data;
    },

    // Get all roadmaps for the user
    getUserRoadmaps: async () => {
        const response = await api.get("roadmap/list/");
        return normalizeArrayPayload(response?.data, ["roadmaps", "items"]);
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
        return normalizeArrayPayload(response?.data, ["projects", "items"]);
    },

    // Get progress for all roadmaps
    getRoadmapProgress: async () => {
        const response = await api.get("roadmap/progress/");
        return response.data;
    },
};
