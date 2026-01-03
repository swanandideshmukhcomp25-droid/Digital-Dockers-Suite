import api from './api';

const userService = {
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

export default userService;
