import api from './api';

const sprintService = {
    createSprint: async (sprintData) => {
        const response = await api.post('/sprints', sprintData);
        return response.data;
    },

    getSprintsByProject: async (projectId) => {
        const response = await api.get(`/sprints/project/${projectId}`);
        return response.data;
    },

    updateSprint: async (id, sprintData) => {
        const response = await api.put(`/sprints/${id}`, sprintData);
        return response.data;
    },

    startSprint: async (id) => {
        const response = await api.post(`/sprints/${id}/start`);
        return response.data;
    },

    completeSprint: async (id) => {
        const response = await api.post(`/sprints/${id}/complete`);
        return response.data;
    }
};

export default sprintService;
