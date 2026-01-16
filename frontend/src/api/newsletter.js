/**
 * Newsletter API Service
 * Handles newsletter subscription operations
 */

import apiClient from './client';

/**
 * Subscribe to newsletter
 * @param {string} email - Email address to subscribe
 * @param {string} source - Source of subscription (homepage, footer, etc.)
 * @returns {Promise} API response
 */
export const subscribe = async (email, source = 'homepage') => {
  const response = await apiClient.post('/newsletter/subscribe', { email, source });
  return response.data;
};

/**
 * Unsubscribe from newsletter
 * @param {string} email - Email address to unsubscribe
 * @param {string} token - Unsubscribe token (optional)
 * @returns {Promise} API response
 */
export const unsubscribe = async (email, token = null) => {
  const response = await apiClient.post('/newsletter/unsubscribe', { email, token });
  return response.data;
};

/**
 * Update subscription preferences
 * @param {string} email - Email address
 * @param {object} preferences - Subscription preferences
 * @returns {Promise} API response
 */
export const updatePreferences = async (email, preferences) => {
  const response = await apiClient.put('/newsletter/preferences', { email, preferences });
  return response.data;
};

/**
 * Get newsletter stats (subscriber count)
 * @returns {Promise} API response with stats
 */
export const getStats = async () => {
  const response = await apiClient.get('/newsletter/stats');
  return response.data;
};

/**
 * Get all subscribers (admin only)
 * @param {object} params - Query parameters (page, limit, active)
 * @returns {Promise} API response with subscribers list
 */
export const getAllSubscribers = async (params = {}) => {
  const response = await apiClient.get('/newsletter/subscribers', { params });
  return response.data;
};

export default {
  subscribe,
  unsubscribe,
  updatePreferences,
  getStats,
  getAllSubscribers
};
