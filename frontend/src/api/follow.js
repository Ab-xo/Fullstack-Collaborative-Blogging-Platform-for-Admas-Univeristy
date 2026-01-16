import api from './client';

export const followAPI = {
  // Follow a user
  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  // Unfollow a user
  unfollowUser: async (userId) => {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },

  // Get follow status
  getFollowStatus: async (userId) => {
    const response = await api.get(`/users/${userId}/follow/status`);
    return response.data;
  },

  // Get followers of a user
  getFollowers: async (userId, page = 1, limit = 20) => {
    const response = await api.get(`/users/${userId}/followers`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Get users that a user is following
  getFollowing: async (userId, page = 1, limit = 20) => {
    const response = await api.get(`/users/${userId}/following`, {
      params: { page, limit }
    });
    return response.data;
  }
};

export default followAPI;
