/**
 * ============================================================================
 * SOCKET EVENT HANDLERS
 * ============================================================================
 * Handles all socket events for real-time collaboration
 */

import { connectionTracker } from './connectionTracker.js';

// Track active editors per post
const activeEditors = new Map(); // postId -> Map<socketId, userInfo>

/**
 * Register all event handlers for a socket
 * @param {Server} io - Socket.io server instance
 * @param {Socket} socket - Socket instance
 */
export const registerHandlers = (io, socket) => {
  const userId = socket.user._id.toString();
  const userInfo = {
    id: userId,
    firstName: socket.user.firstName,
    lastName: socket.user.lastName,
    avatar: socket.user.profile?.avatar || null
  };

  // ==================== POST VIEWING ====================

  /**
   * Join a post viewing room
   * Allows receiving updates for a specific post
   */
  socket.on('join:post', ({ postId }) => {
    if (!postId) return;

    const roomName = `post:${postId}`;
    socket.join(roomName);
    connectionTracker.addRoom(socket.id, roomName);

    console.log(`   → ${socket.user.firstName} joined post room: ${postId}`);
  });

  /**
   * Leave a post viewing room
   */
  socket.on('leave:post', ({ postId }) => {
    if (!postId) return;

    const roomName = `post:${postId}`;
    socket.leave(roomName);
    connectionTracker.removeRoom(socket.id, roomName);

    console.log(`   ← ${socket.user.firstName} left post room: ${postId}`);
  });

  // ==================== COLLABORATIVE EDITING ====================

  /**
   * Join a post editing session
   * Broadcasts presence to other editors
   */
  socket.on('join:edit', ({ postId }) => {
    if (!postId) return;

    const roomName = `edit:${postId}`;
    socket.join(roomName);
    connectionTracker.addRoom(socket.id, roomName);

    // Track active editor
    if (!activeEditors.has(postId)) {
      activeEditors.set(postId, new Map());
    }
    activeEditors.get(postId).set(socket.id, userInfo);

    // Broadcast join to other editors
    socket.to(roomName).emit('presence:join', {
      postId,
      user: userInfo
    });

    // Send current editors list to the joining user
    const editors = Array.from(activeEditors.get(postId).values());
    socket.emit('presence:list', {
      postId,
      users: editors
    });

    console.log(`   ✏️ ${socket.user.firstName} started editing post: ${postId}`);
  });

  /**
   * Leave a post editing session
   * Broadcasts departure to other editors
   */
  socket.on('leave:edit', ({ postId }) => {
    if (!postId) return;

    handleLeaveEdit(io, socket, postId, userInfo);
  });

  // ==================== CATEGORY SUBSCRIPTION ====================

  /**
   * Subscribe to a category for new post notifications
   */
  socket.on('join:category', ({ category }) => {
    if (!category) return;

    const roomName = `category:${category}`;
    socket.join(roomName);
    connectionTracker.addRoom(socket.id, roomName);

    console.log(`   → ${socket.user.firstName} subscribed to category: ${category}`);
  });

  /**
   * Unsubscribe from a category
   */
  socket.on('leave:category', ({ category }) => {
    if (!category) return;

    const roomName = `category:${category}`;
    socket.leave(roomName);
    connectionTracker.removeRoom(socket.id, roomName);

    console.log(`   ← ${socket.user.firstName} unsubscribed from category: ${category}`);
  });

  // ==================== MODERATION ====================

  /**
   * Join moderation room (for moderators/admins)
   */
  socket.on('join:moderation', () => {
    const userRoles = socket.user.roles || [socket.user.role];
    if (!userRoles.includes('moderator') && !userRoles.includes('admin')) {
      socket.emit('error', { message: 'Not authorized to join moderation room' });
      return;
    }

    socket.join('moderators');
    console.log(`   🛡️ ${socket.user.firstName} joined moderation room`);
  });

  /**
   * Leave moderation room
   */
  socket.on('leave:moderation', () => {
    socket.leave('moderators');
    console.log(`   ← ${socket.user.firstName} left moderation room`);
  });

  /**
   * Claim a post for moderation review
   */
  socket.on('claim:post', ({ postId }) => {
    if (!postId) return;

    const userRoles = socket.user.roles || [socket.user.role];
    if (!userRoles.includes('moderator') && !userRoles.includes('admin')) {
      socket.emit('error', { message: 'Not authorized to claim posts' });
      return;
    }

    // Broadcast claim to other moderators
    socket.to('moderators').emit('moderation:claimed', {
      postId,
      claimedBy: userInfo,
      claimedAt: new Date().toISOString()
    });

    console.log(`   🔒 ${socket.user.firstName} claimed post: ${postId}`);
  });

  // ==================== TYPING INDICATORS ====================

  /**
   * Broadcast typing start to other editors
   */
  socket.on('typing:start', ({ postId }) => {
    if (!postId) return;

    socket.to(`edit:${postId}`).emit('typing:user', {
      postId,
      user: userInfo,
      isTyping: true
    });
  });

  /**
 * Broadcast typing stop to other editors
 */
  socket.on("typing:stop", ({ postId }) => {
    if (!postId) return;

    socket.to(`edit:${postId}`).emit("typing:user", {
      postId,
      user: userInfo,
      isTyping: false,
    });
  });

  /**
   * Broadcast content update to other editors
   */
  socket.on("content:update", ({ postId, content, selection }) => {
    if (!postId) return;

    socket.to(`edit:${postId}`).emit("content:changed", {
      postId,
      userId,
      content,
      selection,
      timestamp: new Date().toISOString(),
    });
  });

  // ==================== DISCONNECT CLEANUP ====================

  socket.on("disconnect", () => {
    // Clean up all editing sessions
    for (const [postId, editors] of activeEditors.entries()) {
      if (editors.has(socket.id)) {
        handleLeaveEdit(io, socket, postId, userInfo);
      }
    }
  });
};

/**
 * Handle leaving an editing session
 * @param {Server} io - Socket.io server
 * @param {Socket} socket - Socket instance
 * @param {string} postId - Post ID
 * @param {Object} userInfo - User information
 */
const handleLeaveEdit = (io, socket, postId, userInfo) => {
  const roomName = `edit:${postId}`;
  socket.leave(roomName);
  connectionTracker.removeRoom(socket.id, roomName);

  // Remove from active editors
  const editors = activeEditors.get(postId);
  if (editors) {
    editors.delete(socket.id);
    if (editors.size === 0) {
      activeEditors.delete(postId);
    }
  }

  // Broadcast departure to remaining editors
  io.to(roomName).emit('presence:leave', {
    postId,
    userId: userInfo.id
  });

  console.log(`   ✏️ ${socket.user?.firstName || 'User'} stopped editing post: ${postId}`);
};

/**
 * Get active editors for a post
 * @param {string} postId - Post ID
 * @returns {Object[]} Array of editor info
 */
export const getActiveEditors = (postId) => {
  const editors = activeEditors.get(postId);
  return editors ? Array.from(editors.values()) : [];
};

/**
 * Get count of active editors for a post
 * @param {string} postId - Post ID
 * @returns {number} Number of active editors
 */
export const getActiveEditorsCount = (postId) => {
  const editors = activeEditors.get(postId);
  return editors ? editors.size : 0;
};

export default {
  registerHandlers,
  getActiveEditors,
  getActiveEditorsCount
};
