import apiClient from './client';

// Admin API endpoints
export const adminAPI = {
  // Get pending users
  getPendingUsers: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/admin/pending-users', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get all users
  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    const response = await apiClient.get('/admin/users', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  // Get user details
  getUserDetails: async (userId) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Approve user
  approveUser: async (userId, data = {}) => {
    const response = await apiClient.put(`/admin/users/${userId}/approve`, data);
    return response.data;
  },

  // Reject user
  rejectUser: async (userId, notes = '') => {
    const response = await apiClient.put(`/admin/users/${userId}/reject`, { notes });
    return response.data;
  },

  // Update user roles
  updateUserRoles: async (userId, roles) => {
    const response = await apiClient.put(`/admin/users/${userId}/roles`, { roles });
    return response.data;
  },

  // Suspend user
  suspendUser: async (userId, reason = '') => {
    const response = await apiClient.put(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  },

  // Activate user
  activateUser: async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/activate`);
    return response.data;
  },

  // Bulk approve users
  bulkApproveUsers: async (userIds) => {
    const response = await apiClient.post('/admin/users/bulk-approve', { userIds });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // ==================== AUTHOR APPLICATIONS ====================

  // Get pending author applications
  getPendingAuthors: async () => {
    const response = await apiClient.get('/admin/pending-authors');
    return response.data;
  },

  // Approve author application
  approveAuthor: async (userId) => {
    const response = await apiClient.put(`/admin/authors/${userId}/approve`);
    return response.data;
  },

  // Reject author application
  rejectAuthor: async (userId, reason = '') => {
    const response = await apiClient.put(`/admin/authors/${userId}/reject`, { reason });
    return response.data;
  },

  // ==================== AUDIT LOGS ====================
  
  // Get audit logs
  getAuditLogs: async (page = 1, limit = 20, filters = {}) => {
    const response = await apiClient.get('/admin/audit-logs', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  // Get audit log statistics
  getAuditLogStats: async (days = 30) => {
    const response = await apiClient.get('/admin/audit-logs/stats', {
      params: { days },
    });
    return response.data;
  },

  // ==================== SYSTEM SETTINGS ====================
  
  // Get system settings
  getSystemSettings: async () => {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },

  // Update system settings
  updateSystemSettings: async (settings) => {
    const response = await apiClient.put('/admin/settings', { settings });
    return response.data;
  },
};

export default adminAPI;
