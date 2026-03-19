import api from './axios';

export const executionService = {
    getTodayTask: async () => {
        const response = await api.get('dashboard/today-task/');
        return response.data;
    },

    getAICoach: async (payload = {}) => {
        const response = await api.post('dashboard/ai/coach/', payload);
        return response.data;
    },

    getExecutionTasks: async (type = '') => {
        const params = type ? { type } : undefined;
        const response = await api.get('dashboard/execution/tasks/', { params });
        return response.data;
    },

    createExecutionTask: async (payload) => {
        const response = await api.post('dashboard/execution/tasks/', payload);
        return response.data;
    },

    updateExecutionTask: async (payload) => {
        const response = await api.patch('dashboard/execution/tasks/', payload);
        return response.data;
    },

    createFocusSession: async (payload) => {
        const response = await api.post('dashboard/focus-session/', payload);
        return response.data;
    },

    updateFocusSession: async (payload) => {
        const response = await api.patch('dashboard/focus-session/', payload);
        return response.data;
    },

    generateExamPlan: async (payload) => {
        const response = await api.post('dashboard/exam/plan/', payload);
        return response.data;
    },

    getProgress: async () => {
        const response = await api.get('dashboard/execution/progress/');
        return response.data;
    },
};
