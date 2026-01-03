import api from './api';

const projectService = {
    // Get user's projects
    getProjects: async () => {
        const response = await api.get('/projects');
        return response.data;
    },

    // Alias for compatibility
    getAllProjects: async () => {
        const response = await api.get('/projects');
        return response.data;
    },

    // Create a new project
    createProject: async (projectData) => {
        const response = await api.post('/projects', projectData);
        return response.data;
    },

    // Get project details
    getProjectById: async (projectId) => {
        const response = await api.get(`/projects/${projectId}`);
        return response.data;
    }
};

export default projectService;
