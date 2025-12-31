import api from "../api";

export const schedulerService = {
    // Tasks - Fetch roadmap tasks which have proper due_date for filtering
    getTasks: async () => {
        const response = await api.get("tasks/");
        return response.data;
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
    getGoogleAuthUrl: async () => {
        const response = await api.get("scheduler/google/auth-url/");
        return response.data;
    },

    handleGoogleCallback: async (code) => {
        const response = await api.post("scheduler/google/callback/", { code });
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
};
