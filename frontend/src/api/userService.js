import api from './axios';

export const userService = {
    getProfile: async () => {
        const response = await api.get('users/profile/');
        return response.data;
    },

    updateProfile: async (formData) => {
        const response = await api.patch('users/update-profile/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getStatistics: async () => {
        const response = await api.get('users/statistics/');
        return response.data;
    },

    deleteAccount: async (passwordOrConfirmation, isOAuth = false) => {
        const payload = isOAuth
            ? { confirmation: passwordOrConfirmation }
            : { password: passwordOrConfirmation };
        const response = await api.post('users/delete-account/', payload);
        return response.data;
    },

    checkAuthType: async () => {
        const response = await api.get('users/check-auth-type/');
        return response.data;
    },
};
