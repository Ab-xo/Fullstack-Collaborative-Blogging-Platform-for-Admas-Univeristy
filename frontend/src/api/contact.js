import apiClient from './client';

/**
 * Contact API
 * Handles contact form submissions
 */
export const contactAPI = {
  /**
   * Submit contact form
   * @param {Object} data - Contact form data
   * @param {string} data.firstName - First name
   * @param {string} data.lastName - Last name
   * @param {string} data.email - Email address
   * @param {string} data.subject - Message subject
   * @param {string} data.message - Message content
   */
  submitContactForm: async (data) => {
    const response = await apiClient.post('/contact', data);
    return response.data;
  },

  /**
   * Get all contact messages (Admin only)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - Filter by status
   */
  getMessages: async (params = {}) => {
    const response = await apiClient.get('/contact', { params });
    return response.data;
  },

  /**
   * Get single contact message (Admin only)
   * @param {string} id - Message ID
   */
  getMessage: async (id) => {
    const response = await apiClient.get(`/contact/${id}`);
    return response.data;
  },

  /**
   * Update message status (Admin only)
   * @param {string} id - Message ID
   * @param {string} status - New status
   */
  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/contact/${id}/status`, { status });
    return response.data;
  },

  /**
   * Reply to contact message (Admin only)
   * @param {string} id - Message ID
   * @param {string} replyMessage - Reply content
   */
  replyToMessage: async (id, replyMessage) => {
    const response = await apiClient.post(`/contact/${id}/reply`, { replyMessage });
    return response.data;
  },

  /**
   * Delete contact message (Admin only)
   * @param {string} id - Message ID
   */
  deleteMessage: async (id) => {
    const response = await apiClient.delete(`/contact/${id}`);
    return response.data;
  }
};

export default contactAPI;
