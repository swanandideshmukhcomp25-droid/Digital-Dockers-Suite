import api from './api';

const activityService = {
    // Get activity logs (paginated)
    getActivity: async (params = {}) => {
        const { projectId, limit = 20, page = 1 } = params;
        const queryParams = new URLSearchParams();
        if (projectId) queryParams.append('projectId', projectId);
        if (limit) queryParams.append('limit', limit);
        if (page) queryParams.append('page', page);

        const response = await api.get(`/activity?${queryParams.toString()}`);
        return response.data;
    },

    // Get activity for a specific project
    getProjectActivity: async (projectId, limit = 10) => {
        const response = await api.get(`/activity/project/${projectId}?limit=${limit}`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.put('/activity/mark-read');
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await api.get('/activity/unread-count');
        return response.data;
    }
};

export default activityService;
