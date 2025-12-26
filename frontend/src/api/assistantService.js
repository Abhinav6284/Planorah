import api from '../api';

export const assistantService = {
    // Send a chat message to the AI assistant
    sendMessage: async (message) => {
        const response = await api.post('assistant/chat/', { message });
        return response.data;
    },
};
