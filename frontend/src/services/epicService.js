import api from './api';

const epicService = {
    getEpicsByProject: async (projectId) => {
        const response = await api.get(`/epics/project/${projectId}`);
        return response.data;
    },

    createEpic: async (epicData) => {
        const response = await api.post('/epics', epicData);
        return response.data;
    }
};

export default epicService;
