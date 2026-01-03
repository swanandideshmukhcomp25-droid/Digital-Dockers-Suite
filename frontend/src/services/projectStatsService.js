import api from './api';

const projectStatsService = {
    // Get project statistics for dashboard
    getProjectStats: async (projectId) => {
        const response = await api.get(`/projects/${projectId}/stats`);
        return response.data;
    },

    // Get burndown data for a sprint
    getBurndownData: async (sprintId) => {
        const response = await api.get(`/sprints/${sprintId}/burndown`);
        return response.data;
    }
};

export default projectStatsService;
