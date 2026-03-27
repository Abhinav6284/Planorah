import api from './axios';

const isPrimaryWebHost = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    const host = window.location.hostname.toLowerCase();
    return host === 'planorah.me' || host === 'www.planorah.me';
};

export const userService = {
    getProfile: async () => {
        const response = await api.get('users/profile/');
        return response.data;
    },

    updateProfile: async (formData) => {
        try {
            const response = await api.patch('users/update-profile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            // Avoid retrying against frontend same-origin route in production.
            // It can return 405 and hide the real API failure.
            if (isPrimaryWebHost() && error?.response?.status === 413) {
                const enhancedError = new Error('Profile image is too large. Please upload a smaller file.');
                enhancedError.cause = error;
                enhancedError.status = 413;
                throw enhancedError;
            }
            throw error;
        }
    },

    getStatistics: async () => {
        const response = await api.get('users/statistics/');
        return response.data;
    },

    dailyLogin: async () => {
        const response = await api.post('users/daily-login/');
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
