import client from './client';

/**
 * Feed API Service
 * Handles all feed-related API calls
 */

/**
 * Get following feed for current user
 * @param {Object} params - Query parameters (page, limit, category, sortBy)
 * @returns {Promise} Feed data with posts and pagination
 */
export const getFollowingFeed = async (params = {}) => {
  const { page = 1, limit = 10, category, sortBy = 'newest' } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy
  });
  
  if (category) {
    queryParams.append('category', category);
  }
  
  const response = await client.get(`/feed/following?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get list of authors current user is following
 * @returns {Promise} List of followed authors
 */
export const getFollowedAuthors = async () => {
  const response = await client.get('/feed/following/authors');
  return response.data;
};

/**
 * Get suggested authors to follow
 * @param {Number} limit - Number of suggestions
 * @returns {Promise} List of suggested authors
 */
export const getSuggestedAuthors = async (limit = 5) => {
  const response = await client.get(`/feed/suggestions?limit=${limit}`);
  return response.data;
};
