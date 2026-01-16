import api from './api';

const adminService = {
    // --- User Management ---
    getPendingUsers: async (params) => {
        const response = await api.get('/admin/pending-users', { params });
        return response.data;
    },

    approveUser: async (userId, data) => {
        const response = await api.put(`/admin/users/${userId}/approve`, data);
        return response.data;
    },

    rejectUser: async (userId, reason) => {
        const response = await api.put(`/admin/users/${userId}/reject`, { rejectionReason: reason });
        return response.data;
    },

    getAllUsers: async (params) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    getUserStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // --- Author Application Management ---
    getPendingAuthors: async () => {
        const response = await api.get('/admin/pending-authors');
        return response.data;
    },

    getPendingAuthorsCount: async () => {
        const response = await api.get('/admin/pending-authors');
        return response.data?.count || 0;
    },

    approveAuthor: async (userId) => {
        const response = await api.put(`/admin/authors/${userId}/approve`);
        return response.data;
    },

    rejectAuthor: async (userId, reason = '') => {
        const response = await api.put(`/admin/authors/${userId}/reject`, { reason });
        return response.data;
    },

    // --- System Settings ---
    getSystemSettings: async () => {
        const response = await api.get('/admin/settings');
        return response.data;
    },

    updateSystemSettings: async (settings) => {
        const response = await api.put('/admin/settings', { settings });
        return response.data;
    },
};

export default adminService;
