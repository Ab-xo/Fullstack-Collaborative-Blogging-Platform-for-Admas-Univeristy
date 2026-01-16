/**
 * ============================================================================
 * COLLABORATION API
 * ============================================================================
 * API calls for co-authoring and collaboration features
 */

import api from './client';

export const collaborationAPI = {
  // Get my pending invitations
  getMyInvitations: () => api.get('/collaborations/invitations'),

  // Get posts where I'm a collaborator
  getCollaborativePosts: () => api.get('/collaborations/posts'),

  // Search users to invite
  searchUsers: (query, postId) => {
    console.log('API: Searching users with query:', query, 'postId:', postId);
    return api.get('/collaborations/search-users', { params: { q: query, postId } });
  },

  // Get collaborators for a post
  getCollaborators: (postId) => 
    api.get(`/collaborations/posts/${postId}/collaborators`),

  // Invite a user to collaborate
  inviteCollaborator: (postId, userId, role = 'contributor', message = '') =>
    api.post(`/collaborations/posts/${postId}/collaborators/invite`, { userId, role, message }),

  // Respond to invitation (accept/decline)
  respondToInvitation: (postId, accept) =>
    api.post(`/collaborations/posts/${postId}/collaborators/respond`, { accept }),

  // Remove a collaborator
  removeCollaborator: (postId, userId) =>
    api.delete(`/collaborations/posts/${postId}/collaborators/${userId}`),

  // Leave a collaboration
  leaveCollaboration: (postId) =>
    api.post(`/collaborations/posts/${postId}/collaborators/leave`),
};

export default collaborationAPI;
