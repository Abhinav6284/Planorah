import api from "../api";

export const schedulerService = {
    // Tasks - Fetch roadmap tasks which have proper due_date for filtering
    getTasks: async () => {
        const response = await api.get("tasks/");
        const payload = response?.data;
        if (Array.isArray(payload)) {
            return payload;
        }
        if (Array.isArray(payload?.tasks)) {
            return payload.tasks;
        }
        return [];
    },

    getTaskGuidance: async (taskId) => {
        const response = await api.get(`tasks/${taskId}/guidance/`);
        return response.data;
    },

    createTask: async (data) => {
        const response = await api.post("dashboard/tasks/create/", data);
        return response.data;
    },

    updateTask: async (id, data) => {
        const response = await api.patch(`dashboard/tasks/${id}/update/`, data);
        return response.data;
    },

    deleteTask: async (id) => {
        const response = await api.delete(`dashboard/tasks/${id}/delete/`);
        return response.data;
    },

    // Events
    getEvents: async () => {
        const response = await api.get("scheduler/events/");
        return response.data;
    },

    createEvent: async (data) => {
        const response = await api.post("scheduler/events/create/", data);
        return response.data;
    },

    deleteAllEvents: async () => {
        const response = await api.delete("scheduler/events/delete-all/");
        return response.data;
    },

    // Google Calendar
    getGoogleAuthUrl: async (redirectUri = "") => {
        const response = await api.get("scheduler/google/auth-url/", {
            params: redirectUri ? { redirect_uri: redirectUri } : undefined,
        });
        return response.data;
    },

    handleGoogleCallback: async (code, redirectUri = "", state = "") => {
        const payload = { code };
        if (redirectUri) {
            payload.redirect_uri = redirectUri;
        }
        if (state) {
            payload.state = state;
        }
        const response = await api.post("scheduler/google/callback/", payload);
        return response.data;
    },

    syncGoogleCalendar: async () => {
        const response = await api.get("scheduler/google/sync/");
        return response.data;
    },

    // Spotify
    getSpotifyAuthUrl: async () => {
        const response = await api.get("scheduler/spotify/auth-url/");
        return response.data;
    },

    handleSpotifyCallback: async (code) => {
        const response = await api.post("scheduler/spotify/callback/", { code });
        return response.data;
    },

    getCurrentSong: async () => {
        const response = await api.get("scheduler/spotify/current/");
        return response.data;
    },

    controlSpotify: async (action) => {
        const response = await api.post("scheduler/spotify/control/", { action });
        return response.data;
    },

    getQueue: async () => {
        const response = await api.get("scheduler/spotify/queue/");
        return response.data;
    },

    getDashboardStats: async () => {
        const response = await api.get("dashboard/stats/");
        return response.data;
    },

    getOnboardingInsights: async () => {
        const response = await api.get("dashboard/onboarding-insights/");
        return response.data;
    },
};
