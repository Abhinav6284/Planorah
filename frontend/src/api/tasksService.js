import axios from './axios';

export const tasksService = {
    // Tasks
    getTasks: (filters = {}) => axios.get('/api/tasks/', { params: filters }),
    getTask: (id) => axios.get(`/api/tasks/${id}/`),
    createTask: (data) => axios.post('/api/tasks/', data),
    updateTask: (id, data) => axios.put(`/api/tasks/${id}/`, data),
    deleteTask: (id) => axios.delete(`/api/tasks/${id}/`),

    // Special endpoints
    getTodayTasks: () => axios.get('/api/tasks/today/'),
    getTasksByDay: (day) => axios.get(`/api/tasks/`, { params: { day } }),
    getDayTasks: (date) => axios.get(`/api/tasks/`, { params: { due_date: date } }),

    // Actions
    completeTask: (id) => axios.patch(`/api/tasks/${id}/complete/`),
    rescheduleTask: (id, day, due_date) => axios.patch(`/api/tasks/${id}/reschedule/`, { day, due_date }),

    // Analytics
    getAnalytics: () => axios.get('/api/tasks/analytics/'),
};
