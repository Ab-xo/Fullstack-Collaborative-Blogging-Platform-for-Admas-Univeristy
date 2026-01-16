/**
 * ============================================================================
 * SOCKET SERVICE
 * ============================================================================
 * Service for emitting real-time events from controllers and services
 */

import { SERVER_EVENTS, ROOMS } from '../socket/events.js';
import { connectionTracker } from '../socket/connectionTracker.js';

class SocketService {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize the socket service with Socket.io instance
   */
  initialize(io) {
    this.io = io;
  }

  /**
   * Check if socket service is initialized
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this.io !== null;
  }

  // ==================== USER NOTIFICATIONS ====================

  /**
   * Emit event to a specific user (all their connections)
   * @param {string} userId - User ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToUser(userId, event, data) {
    if (!this.io) return;
    
    const room = ROOMS.user(userId);
    this.io.to(room).emit(event, data);
  }

  /**
   * Send a new notification to a user
   * @param {string} userId - User ID
   * @param {Object} notification - Notification object
   */
  sendNotification(userId, notification) {
    this.emitToUser(userId, SERVER_EVENTS.NOTIFICATION_NEW, notification);
  }

  /**
   * Update notification count for a user
   * @param {string} userId - User ID
   * @param {number} count - Unread notification count
   */
  updateNotificationCount(userId, count) {
    this.emitToUser(userId, SERVER_EVENTS.NOTIFICATION_COUNT, { count });
  }

  // ==================== POST EVENTS ====================

  /**
   * Emit event to all users viewing a post
   * @param {string} postId - Post ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToPostViewers(postId, event, data) {
    if (!this.io) return;
    
    const room = ROOMS.post(postId);
    this.io.to(room).emit(event, data);
  }

  /**
   * Emit event to all users editing a post
   * @param {string} postId - Post ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToPostEditors(postId, event, data) {
    if (!this.io) return;
    
    const room = ROOMS.edit(postId);
    this.io.to(room).emit(event, data);
  }

  /**
   * Broadcast new post to category subscribers
   * @param {string} category - Category name
   * @param {Object} post - Post object
   */
  broadcastNewPost(category, post) {
    if (!this.io) return;
    
    const room = ROOMS.category(category);
    this.io.to(room).emit(SERVER_EVENTS.POST_NEW, post);
  }

  /**
   * Broadcast post update to viewers
   * @param {string} postId - Post ID
   * @param {Object} changes - Changed fields
   */
  broadcastPostUpdate(postId, changes) {
    this.emitToPostViewers(postId, SERVER_EVENTS.POST_UPDATED, {
      postId,
      changes,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Broadcast post deletion
   * @param {string} postId - Post ID
   */
  broadcastPostDeleted(postId) {
    this.emitToPostViewers(postId, SERVER_EVENTS.POST_DELETED, { postId });
  }

  // ==================== COMMENT EVENTS ====================

  /**
   * Broadcast new comment to post viewers
   * @param {string} postId - Post ID
   * @param {Object} comment - Comment object
   */
  broadcastNewComment(postId, comment) {
    this.emitToPostViewers(postId, SERVER_EVENTS.COMMENT_NEW, {
      postId,
      comment
    });
  }

  /**
   * Broadcast comment update to post viewers
   * @param {string} postId - Post ID
   * @param {Object} comment - Updated comment object
   */
  broadcastCommentUpdate(postId, comment) {
    this.emitToPostViewers(postId, SERVER_EVENTS.COMMENT_UPDATED, {
      postId,
      comment
    });
  }

  /**
   * Broadcast comment deletion to post viewers
   * @param {string} postId - Post ID
   * @param {string} commentId - Comment ID
   */
  broadcastCommentDeleted(postId, commentId) {
    this.emitToPostViewers(postId, SERVER_EVENTS.COMMENT_DELETED, {
      postId,
      commentId
    });
  }

  // ==================== ENGAGEMENT EVENTS ====================

  /**
   * Broadcast engagement update (likes, views, etc.)
   * @param {string} postId - Post ID
   * @param {Object} engagement - Engagement data
   */
  broadcastEngagementUpdate(postId, engagement) {
    this.emitToPostViewers(postId, SERVER_EVENTS.ENGAGEMENT_UPDATE, {
      postId,
      ...engagement
    });
  }

  // ==================== MODERATION EVENTS ====================

  /**
   * Emit event to all moderators
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToModerators(event, data) {
    if (!this.io) return;
    
    this.io.to(ROOMS.moderators).emit(event, data);
  }

  /**
   * Emit event to all admins
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToAdmins(event, data) {
    if (!this.io) return;
    
    this.io.to(ROOMS.admins).emit(event, data);
  }

  /**
   * Notify moderators of new pending post
   * @param {Object} post - Post object
   * @param {string} authorName - Author's name
   */
  notifyModeratorsNewPost(post, authorName) {
    this.emitToModerators(SERVER_EVENTS.MODERATION_NEW, {
      post: {
        _id: post._id,
        title: post.title,
        category: post.category,
        author: authorName,
        createdAt: post.createdAt
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Notify moderators that a post was approved
   * @param {string} postId - Post ID
   * @param {string} moderatorName - Moderator's name
   */
  notifyModeratorsPostApproved(postId, moderatorName) {
    this.emitToModerators(SERVER_EVENTS.MODERATION_APPROVED, {
      postId,
      approvedBy: moderatorName,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Notify moderators that a post was rejected
   * @param {string} postId - Post ID
   * @param {string} moderatorName - Moderator's name
   */
  notifyModeratorsPostRejected(postId, moderatorName) {
    this.emitToModerators(SERVER_EVENTS.MODERATION_REJECTED, {
      postId,
      rejectedBy: moderatorName,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Notify moderators of content violation detected during writing
   * @param {Object} violationData - Violation details
   */
  notifyModeratorsViolation(violationData) {
    this.emitToModerators(SERVER_EVENTS.MODERATION_VIOLATION_ALERT, {
      ...violationData,
      timestamp: new Date().toISOString()
    });
  }

  // ==================== CATEGORY EVENTS ====================

  /**
   * Emit event to category subscribers
   * @param {string} category - Category name
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToCategory(category, event, data) {
    if (!this.io) return;
    
    const room = ROOMS.category(category);
    this.io.to(room).emit(event, data);
  }

  // ==================== PRESENCE EVENTS ====================

  /**
   * Broadcast presence update to post editors
   * @param {string} postId - Post ID
   * @param {string} event - Event name
   * @param {Object} data - Presence data
   */
  broadcastPresence(postId, event, data) {
    this.emitToPostEditors(postId, event, data);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if a user is online
   * @param {string} userId - User ID
   * @returns {boolean} True if user is online
   */
  isUserOnline(userId) {
    return connectionTracker.isUserOnline(userId);
  }

  /**
   * Get online users count
   * @returns {number} Number of online users
   */
  getOnlineUsersCount() {
    return connectionTracker.getOnlineUsersCount();
  }

  /**
   * Get all online user IDs
   * @returns {string[]} Array of user IDs
   */
  getOnlineUserIds() {
    return connectionTracker.getOnlineUserIds();
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
