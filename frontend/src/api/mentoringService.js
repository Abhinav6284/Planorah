import api from '../api';

export const mentoringService = {
    /**
     * Create a new AI mentoring session.
     * @param {Object} data - { context_source, transcript, student_goal?, current_progress? }
     * @returns {Promise<Object>} Full session response with AI insights
     */
    createSession: async (data) => {
        const response = await api.post('ai-mentoring/session/', data);
        return response.data;
    },

    /**
     * List the current user's mentoring sessions.
     * @param {Object} params - Optional { context_source, limit }
     * @returns {Promise<Array>} List of session objects
     */
    listSessions: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `ai-mentoring/sessions/?${queryString}` : 'ai-mentoring/sessions/';
        const response = await api.get(url);
        return response.data;
    },
};
