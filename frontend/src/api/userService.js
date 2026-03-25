import api from './axios';

const isPrimaryWebHost = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    const host = window.location.hostname.toLowerCase();
    return host === 'planorah.me' || host === 'www.planorah.me';
};

const shouldRetryProfileUpdateSameOrigin = (error) => {
    if (!isPrimaryWebHost()) {
        return false;
    }

    // CORS/network failures typically surface as Axios "Network Error" without response.
    if (!error?.response) {
        return true;
    }

    // Retry specific upstream/proxy failures that can occur on API edge.
    return [404, 502, 503, 504].includes(error.response.status);
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
            if (!shouldRetryProfileUpdateSameOrigin(error)) {
                throw error;
            }

            const fallbackResponse = await api.patch(`${window.location.origin}/api/users/update-profile/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return fallbackResponse.data;
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
