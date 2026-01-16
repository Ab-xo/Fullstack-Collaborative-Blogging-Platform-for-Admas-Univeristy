/**
 * ============================================================================
 * SOCKET EVENT CONSTANTS
 * ============================================================================
 * Centralized event names for consistency
 */

// Server -> Client Events
export const SERVER_EVENTS = {
  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_COUNT: 'notification:count',
  
  // Posts
  POST_NEW: 'post:new',
  POST_UPDATED: 'post:updated',
  POST_DELETED: 'post:deleted',
  
  // Comments
  COMMENT_NEW: 'comment:new',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  
  // Engagement
  ENGAGEMENT_UPDATE: 'engagement:update',
  
  // Presence
  PRESENCE_JOIN: 'presence:join',
  PRESENCE_LEAVE: 'presence:leave',
  PRESENCE_LIST: 'presence:list',
  
  // Typing
  TYPING_USER: 'typing:user',
  
  // Moderation
  MODERATION_NEW: 'moderation:new',
  MODERATION_CLAIMED: 'moderation:claimed',
  MODERATION_APPROVED: 'moderation:approved',
  MODERATION_REJECTED: 'moderation:rejected',
  MODERATION_VIOLATION_ALERT: 'moderation:violation_alert',
  
  // Errors
  ERROR: 'error'
};

// Client -> Server Events
export const CLIENT_EVENTS = {
  // Room management
  JOIN_POST: 'join:post',
  LEAVE_POST: 'leave:post',
  JOIN_EDIT: 'join:edit',
  LEAVE_EDIT: 'leave:edit',
  JOIN_CATEGORY: 'join:category',
  LEAVE_CATEGORY: 'leave:category',
  JOIN_MODERATION: 'join:moderation',
  LEAVE_MODERATION: 'leave:moderation',
  
  // Actions
  CLAIM_POST: 'claim:post',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop'
};

// Room name generators
export const ROOMS = {
  user: (userId) => `user:${userId}`,
  post: (postId) => `post:${postId}`,
  edit: (postId) => `edit:${postId}`,
  category: (category) => `category:${category}`,
  moderators: 'moderators',
  admins: 'admins'
};

export default {
  SERVER_EVENTS,
  CLIENT_EVENTS,
  ROOMS
};
