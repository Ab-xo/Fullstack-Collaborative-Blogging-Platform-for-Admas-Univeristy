/**
 * ============================================================================
 * CONNECTION TRACKER
 * ============================================================================
 * Tracks multiple socket connections per user for multi-tab support
 */

class ConnectionTracker {
  constructor() {
    // Map: userId -> Set<socketId>
    this.connections = new Map();
    // Map: socketId -> { userId, rooms: Set<roomName> }
    this.socketInfo = new Map();
  }

  /**
   * Add a new connection for a user
   * @param {string} userId - User ID
   * @param {string} socketId - Socket ID
   */
  addConnection(userId, socketId) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId).add(socketId);
    this.socketInfo.set(socketId, { userId, rooms: new Set() });
  }

  /**
   * Remove a connection for a user
   * @param {string} userId - User ID
   * @param {string} socketId - Socket ID
   */
  removeConnection(userId, socketId) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(socketId);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
    this.socketInfo.delete(socketId);
  }

  /**
   * Get all socket IDs for a user
   * @param {string} userId - User ID
   * @returns {string[]} Array of socket IDs
   */
  getUserSockets(userId) {
    const sockets = this.connections.get(userId);
    return sockets ? Array.from(sockets) : [];
  }

  /**
   * Check if user is online (has at least one connection)
   * @param {string} userId - User ID
   * @returns {boolean} True if user is online
   */
  isUserOnline(userId) {
    const sockets = this.connections.get(userId);
    return !!(sockets && sockets.size > 0);
  }

  /**
   * Get connection count for a user
   * @param {string} userId - User ID
   * @returns {number} Number of active connections
   */
  getConnectionCount(userId) {
    const sockets = this.connections.get(userId);
    return sockets ? sockets.size : 0;
  }

  /**
   * Track room membership for a socket
   * @param {string} socketId - Socket ID
   * @param {string} roomName - Room name
   */
  addRoom(socketId, roomName) {
    const info = this.socketInfo.get(socketId);
    if (info) {
      info.rooms.add(roomName);
    }
  }

  /**
   * Remove room membership for a socket
   * @param {string} socketId - Socket ID
   * @param {string} roomName - Room name
   */
  removeRoom(socketId, roomName) {
    const info = this.socketInfo.get(socketId);
    if (info) {
      info.rooms.delete(roomName);
    }
  }

  /**
   * Get rooms for a socket
   * @param {string} socketId - Socket ID
   * @returns {string[]} Array of room names
   */
  getSocketRooms(socketId) {
    const info = this.socketInfo.get(socketId);
    return info ? Array.from(info.rooms) : [];
  }

  /**
   * Get total online users count
   * @returns {number} Number of online users
   */
  getOnlineUsersCount() {
    return this.connections.size;
  }

  /**
   * Get all online user IDs
   * @returns {string[]} Array of user IDs
   */
  getOnlineUserIds() {
    return Array.from(this.connections.keys());
  }
}

// Singleton instance
export const connectionTracker = new ConnectionTracker();

export default connectionTracker;
