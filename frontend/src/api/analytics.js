import apiClient from './client';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const getCacheKey = (endpoint, params) => {
  return `${endpoint}-${JSON.stringify(params || {})}`;
};

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Admin Analytics
export const getAdminDashboard = async (params = {}) => {
  const cacheKey = getCacheKey('admin-dashboard', params);
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const response = await apiClient.get('/analytics/admin/dashboard', {
    params,
  });
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// Moderator Analytics
export const getModeratorDashboard = async (params = {}) => {
  const cacheKey = getCacheKey('moderator-dashboard', params);
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const response = await apiClient.get('/analytics/moderator/dashboard', {
    params,
  });
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// Author Analytics
export const getAuthorDashboard = async (params = {}) => {
  const cacheKey = getCacheKey('author-dashboard', params);
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const response = await apiClient.get('/analytics/author/dashboard', {
    params,
  });
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// Post Trends
export const getPostTrends = async (params = {}) => {
  const cacheKey = getCacheKey('post-trends', params);
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const response = await apiClient.get('/analytics/posts/trends', {
    params,
  });
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// User Activity
export const getUserActivity = async (params = {}) => {
  const cacheKey = getCacheKey('user-activity', params);
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const response = await apiClient.get('/analytics/users/activity', {
    params,
  });
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// Category Stats
export const getCategoryStats = async (params = {}) => {
  const cacheKey = getCacheKey('category-stats', params);
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const response = await apiClient.get('/analytics/categories/stats', {
    params,
  });
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// Network Interactions (for D3 visualizations)
export const getNetworkInteractions = async (params = {}) => {
  const cacheKey = getCacheKey('network-interactions', params);
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const response = await apiClient.get('/analytics/network/interactions', {
    params,
  });
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// Clear cache (useful for forcing refresh)
export const clearAnalyticsCache = () => {
  cache.clear();
};

export default {
  getAdminDashboard,
  getModeratorDashboard,
  getAuthorDashboard,
  getPostTrends,
  getUserActivity,
  getCategoryStats,
  getNetworkInteractions,
  clearAnalyticsCache
};
