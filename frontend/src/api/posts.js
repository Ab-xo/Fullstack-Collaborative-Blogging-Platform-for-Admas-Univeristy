import apiClient from './client';

// Blog Posts API endpoints
export const postsAPI = {
  // Get all posts with enhanced filtering
  getPosts: async (filters = {}) => {
    const response = await apiClient.get('/posts', {
      params: filters,
    });
    return response.data;
  },

  // Get all posts for admin moderation (includes all statuses)
  getAdminPosts: async (filters = {}) => {
    const response = await apiClient.get('/posts', {
      params: { ...filters, adminView: true },
    });
    return response.data;
  },

  // Get single post (without tracking view)
  getPost: async (postId) => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  },

  // Get single post and track view (use this for actual page views)
  getPostWithView: async (postId) => {
    const response = await apiClient.get(`/posts/${postId}`, {
      headers: {
        'X-Track-View': 'true'
      }
    });
    return response.data;
  },

  // Create post
  createPost: async (postData) => {
    const response = await apiClient.post('/posts', postData);
    return response.data;
  },

  // Update post
  updatePost: async (postId, postData) => {
    const response = await apiClient.put(`/posts/${postId}`, postData);
    return response.data;
  },

  // Delete post
  deletePost: async (postId) => {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  },

  // Like post
  likePost: async (postId) => {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
  },

  // Unlike post
  unlikePost: async (postId) => {
    const response = await apiClient.delete(`/posts/${postId}/like`);
    return response.data;
  },

  // Dislike post
  dislikePost: async (postId) => {
    const response = await apiClient.post(`/posts/${postId}/dislike`);
    return response.data;
  },

  // Remove dislike from post
  undislikePost: async (postId) => {
    const response = await apiClient.delete(`/posts/${postId}/dislike`);
    return response.data;
  },

  // Get posts by category
  getPostsByCategory: async (category, params = {}) => {
    const response = await apiClient.get(`/posts/category/${category}`, {
      params,
    });
    return response.data;
  },

  // Search posts
  searchPosts: async (query, params = {}) => {
    const response = await apiClient.get('/posts/search', {
      params: { q: query, ...params },
    });
    return response.data;
  },

  // Get user's posts
  getUserPosts: async (userId, params = {}) => {
    const response = await apiClient.get(`/posts/user/${userId}`, {
      params,
    });
    return response.data;
  },

  // Get categories with post counts
  getCategories: async () => {
    const response = await apiClient.get('/posts/categories');
    return response.data;
  },

  // Get tags with post counts
  getTags: async (limit = 50) => {
    const response = await apiClient.get('/posts/tags', {
      params: { limit },
    });
    return response.data;
  },

  // Approve post (moderator/admin)
  approvePost: async (postId, moderationNotes = '') => {
    const response = await apiClient.put(`/posts/${postId}/approve`, {
      moderationNotes,
    });
    return response.data;
  },

  // Reject post (moderator/admin)
  rejectPost: async (postId, moderationNotes) => {
    const response = await apiClient.put(`/posts/${postId}/reject`, {
      moderationNotes,
    });
    return response.data;
  },

  // Upload featured image to Cloudinary
  uploadFeaturedImage: async (file) => {
    const formData = new FormData();
    formData.append('featuredImage', file);
    
    const response = await apiClient.post('/posts/upload-featured-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Create draft post
  createDraft: async (postData) => {
    const response = await apiClient.post('/posts', {
      ...postData,
      status: 'draft',
    });
    return response.data;
  },

  // Get flagged posts (posts with AI-detected violations)
  getFlaggedPosts: async (params = {}) => {
    const response = await apiClient.get('/posts/moderation/flagged', {
      params,
    });
    return response.data;
  },

  // Remove flagged content (delete post)
  removeFlaggedContent: async (postId) => {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  },

  // Dismiss violation (approve post despite violations)
  dismissViolation: async (postId, moderationNotes = '') => {
    const response = await apiClient.put(`/posts/${postId}/approve`, {
      moderationNotes: moderationNotes || 'Violation dismissed by moderator',
    });
    return response.data;
  },
};

export default postsAPI;

// Named exports for convenience
export const {
  getPosts,
  getAdminPosts,
  getPost,
  getPostWithView,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  dislikePost,
  undislikePost,
  getPostsByCategory,
  searchPosts,
  getUserPosts,
  getCategories,
  getTags,
  approvePost,
  rejectPost,
  uploadFeaturedImage,
  createDraft,
  getFlaggedPosts,
  removeFlaggedContent,
  dismissViolation,
} = postsAPI;
