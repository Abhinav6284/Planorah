import api from '../api';

export const assistantService = {
    // Send a chat message to the AI assistant
    sendMessage: async (message) => {
        try {
            const response = await api.post('assistant/chat/', { message });
            return response.data;
        } catch (error) {
            const status = error?.response?.status;
            const serverMessage = error?.response?.data?.error;

            // Gracefully handle AI provider rate limits so UI stays usable.
            if (status === 429) {
                return {
                    message: serverMessage || "I'm receiving too many requests right now. Please wait a minute and try again.",
                    success: false,
                    rate_limited: true,
                };
            }

            throw error;
        }
    },
};
