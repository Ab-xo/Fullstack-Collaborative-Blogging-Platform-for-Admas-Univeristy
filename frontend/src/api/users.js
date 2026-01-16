import client from './client';

/**
 * Users API
 */
export const usersAPI = {
  /**
   * Get dashboard stats for current user
   */
  getDashboardStats: async () => {
    const response = await client.get('/users/dashboard/stats');
    return response.data;
  },

  /**
   * Get user's posts
   */
  getUserPosts: async (params = {}) => {
    const { limit = 10, page = 1 } = params;
    const response = await client.get(`/users/posts?limit=${limit}&page=${page}`);
    return response.data;
  },

  /**
   * Resend email verification
   */
  resendEmailVerification: async () => {
    const response = await client.post('/auth/resend-verification');
    return response.data;
  },
};

/**
 * Follow a user
 * @param {String} userId - ID of user to follow
 * @returns {Promise}
 */
export const followUser = async (userId) => {
  const response = await client.post(`/users/${userId}/follow`);
  return response.data;
};

/**
 * Unfollow a user
 * @param {String} userId - ID of user to unfollow
 * @returns {Promise}
 */
export const unfollowUser = async (userId) => {
  const response = await client.delete(`/users/${userId}/follow`);
  return response.data;
};

/**
 * Get follow status for a user
 * @param {String} userId - ID of user
 * @returns {Promise}
 */
export const getFollowStatus = async (userId) => {
  const response = await client.get(`/users/${userId}/follow/status`);
  return response.data;
};

/**
 * Get followers of a user
 * @param {String} userId - ID of user
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise}
 */
export const getFollowers = async (userId, params = {}) => {
  const { page = 1, limit = 20 } = params;
  const response = await client.get(`/users/${userId}/followers?page=${page}&limit=${limit}`);
  return response.data;
};

/**
 * Get users that a user is following
 * @param {String} userId - ID of user
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise}
 */
export const getFollowing = async (userId, params = {}) => {
  const { page = 1, limit = 20 } = params;
  const response = await client.get(`/users/${userId}/following?page=${page}&limit=${limit}`);
  return response.data;
};
