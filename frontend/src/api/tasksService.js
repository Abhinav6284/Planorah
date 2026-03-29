import axios from './axios';

const normalizeArrayPayload = (payload, keys = []) => {
    if (Array.isArray(payload)) return payload;
    for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
    }
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
};

const withNormalizedArrayData = (requestPromise, keys = []) => requestPromise.then((response) => {
    const rawData = response?.data;
    return {
        ...response,
        data: normalizeArrayPayload(rawData, keys),
        meta: rawData?.meta || null,
    };
});

export const tasksService = {
    // Tasks
    getTasks: (filters = {}) => withNormalizedArrayData(
        axios.get('tasks/', { params: filters }),
        ['tasks', 'items']
    ),
    getTask: (id) => axios.get(`tasks/${id}/`),
    createTask: (data) => axios.post('tasks/', data),
    updateTask: (id, data) => axios.put(`tasks/${id}/`, data),
    deleteTask: (id) => axios.delete(`tasks/${id}/`),

    // Special endpoints
    getTodayTasks: () => withNormalizedArrayData(
        axios.get('tasks/today/'),
        ['tasks', 'items']
    ),
    getTasksByDay: (day) => withNormalizedArrayData(
        axios.get(`tasks/`, { params: { day } }),
        ['tasks', 'items']
    ),
    getDayTasks: (date) => withNormalizedArrayData(
        axios.get(`tasks/`, { params: { due_date: date } }),
        ['tasks', 'items']
    ),

    // Actions
    completeTask: (id) => axios.patch(`tasks/${id}/complete/`),
    rescheduleTask: (id, day, due_date) => axios.patch(`tasks/${id}/reschedule/`, { day, due_date }),

    // AI Guidance - Get step-by-step instructions for a task
    getTaskGuidance: (id) => axios.get(`tasks/${id}/guidance/`),

    // Analytics
    getAnalytics: () => axios.get('tasks/analytics/'),
};
