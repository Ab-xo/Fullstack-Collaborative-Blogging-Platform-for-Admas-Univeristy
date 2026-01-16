import apiClient from './client';

// Comments API endpoints
export const commentsAPI = {
  // Get all comments for a post
  getComments: async (postId) => {
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data;
  },

  // Create a comment
  createComment: async (postId, content, parentCommentId = null) => {
    const response = await apiClient.post(`/posts/${postId}/comments`, {
      content,
      parentCommentId,
    });
    return response.data;
  },

  // Update a comment
  updateComment: async (commentId, content) => {
    const response = await apiClient.put(`/comments/${commentId}`, {
      content,
    });
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  },

  // Like a comment
  likeComment: async (commentId) => {
    const response = await apiClient.post(`/comments/${commentId}/like`);
    return response.data;
  },

  // Unlike a comment
  unlikeComment: async (commentId) => {
    const response = await apiClient.delete(`/comments/${commentId}/like`);
    return response.data;
  },
};

export default commentsAPI;
