import api from './api';

const searchService = {
    // Global search across tasks and projects
    globalSearch: async (query) => {
        if (!query || query.length < 2) {
            return { tasks: [], projects: [] };
        }
        const response = await api.get(`/tasks/search?query=${encodeURIComponent(query)}`);
        return response.data;
    },

    // Get tasks assigned to current user
    getAssignedToMe: async (limit = 10) => {
        const response = await api.get(`/tasks/assigned-to-me?limit=${limit}`);
        return response.data;
    }
};

export default searchService;
