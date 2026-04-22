import api from './axios';

export const sessionsService = {
    requestSession: async (topicTags = [], description = '') => {
        const response = await api.post('sessions/request/', {
            topic_tags: topicTags,
            description,
        });
        return response.data;
    },

    listSessions: async () => {
        const response = await api.get('sessions/');
        return response.data;
    },

    getRemaining: async () => {
        const response = await api.get('sessions/remaining/');
        return response.data;
    },

    listNotifications: async () => {
        const response = await api.get('sessions/notifications/');
        return response.data;
    },

    markNotificationRead: async (id) => {
        const response = await api.patch(`sessions/notifications/${id}/read/`);
        return response.data;
    },
};
