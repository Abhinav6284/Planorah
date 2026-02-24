import axios from './axios';

export const tasksService = {
    // Tasks
    getTasks: (filters = {}) => axios.get('tasks/', { params: filters }),
    getTask: (id) => axios.get(`tasks/${id}/`),
    createTask: (data) => axios.post('tasks/', data),
    updateTask: (id, data) => axios.put(`tasks/${id}/`, data),
    deleteTask: (id) => axios.delete(`tasks/${id}/`),

    // Special endpoints
    getTodayTasks: () => axios.get('tasks/today/'),
    getTasksByDay: (day) => axios.get(`tasks/`, { params: { day } }),
    getDayTasks: (date) => axios.get(`tasks/`, { params: { due_date: date } }),

    // Actions
    completeTask: (id) => axios.patch(`tasks/${id}/complete/`),
    rescheduleTask: (id, day, due_date) => axios.patch(`tasks/${id}/reschedule/`, { day, due_date }),

    // AI Guidance - Get step-by-step instructions for a task
    getTaskGuidance: (id) => axios.get(`tasks/${id}/guidance/`),

    // Analytics
    getAnalytics: () => axios.get('tasks/analytics/'),
};
