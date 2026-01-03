import api from './api';

const chatbotService = {
    sendMessage: async (message) => {
        const response = await api.post('/chatbot/message', { message });
        return response.data;
    },

    getWelcome: async () => {
        const response = await api.get('/chatbot/welcome');
        return response.data;
    }
};

export default chatbotService;
