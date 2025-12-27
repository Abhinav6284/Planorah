import api from './axios';

export const userService = {
    getProfile: async () => {
        const response = await api.get('/api/users/profile/');
        return response.data;
    },

    updateProfile: async (formData) => {
        const response = await api.patch('/api/users/update-profile/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getStatistics: async () => {
        const response = await api.get('/api/users/statistics/');
        return response.data;
    },

    deleteAccount: async (password) => {
        const response = await api.post('/api/users/delete-account/', { password });
        return response.data;
    },
};
