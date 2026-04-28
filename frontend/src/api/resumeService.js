import api from "./axios";

export const resumeService = {
    // Generate new resume from PASS attempts
    generateResume: async (roadmapId, templateId = null) => {
        const response = await api.post("resume/generate/", {
            roadmap_id: roadmapId,
            template_id: templateId
        });
        return response.data;
    },

    // Get latest resume for roadmap
    getLatestResume: async (roadmapId) => {
        const response = await api.get(`resume/latest/`, {
            params: { roadmap_id: roadmapId }
        });
        return response.data;
    },

    // Get specific resume version
    getResumeVersion: async (versionId) => {
        const response = await api.get(`resume/${versionId}/`);
        return response.data;
    },

    // Get all resume versions for user
    getResumeHistory: async () => {
        const response = await api.get("resume/");
        return response.data;
    },

    // Verify resume integrity
    verifyResume: async (versionId) => {
        const response = await api.get(`resume/${versionId}/verify/`);
        return response.data;
    },

    // Export resume
    exportResume: async (versionId, format = 'json') => {
        const response = await api.get(`resume/${versionId}/export/`, {
            params: { format }
        });
        return response.data;
    }
};

export default resumeService;
