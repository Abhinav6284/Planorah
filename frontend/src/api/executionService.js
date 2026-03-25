import api from './axios';

const requestWith404Fallback = async (primaryRequest, fallbackRequest) => {
    try {
        return await primaryRequest();
    } catch (error) {
        if (error?.response?.status === 404 && fallbackRequest) {
            return fallbackRequest();
        }
        throw error;
    }
};

export const executionService = {
    getTodayTask: async () => {
        const response = await requestWith404Fallback(
            () => api.get('dashboard/today-task/'),
            () => api.get('today-task/')
        );
        return response.data;
    },

    getAICoach: async (payload = {}) => {
        const response = await requestWith404Fallback(
            () => api.post('dashboard/ai/coach/', payload),
            () => api.post('ai/coach/', payload)
        );
        return response.data;
    },

    getExecutionTasks: async (type = '') => {
        const params = type ? { type } : undefined;
        const response = await requestWith404Fallback(
            () => api.get('dashboard/execution/tasks/', { params }),
            () => api.get('execution/tasks/', { params })
        );
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

    applyRewards: async (payload) => {
        const response = await requestWith404Fallback(
            () => api.post('dashboard/rewards/apply/', payload),
            () => api.post('rewards/apply/', payload)
        );
        return response.data;
    },

    getProgress: async () => {
        const response = await requestWith404Fallback(
            () => api.get('dashboard/execution/progress/'),
            () => api.get('execution/progress/')
        );
        return response.data;
    },
};
