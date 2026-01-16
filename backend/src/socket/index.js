/**
 * Socket.io Server Initialization
 */

import { Server } from 'socket.io';
import { verifySocketToken } from './auth.js';
import { registerHandlers } from './handlers.js';
import { connectionTracker } from './connectionTracker.js';

let io = null;

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    transports: ['websocket', 'polling'],
    allowUpgrades: true
  });

  // Authentication middleware
  io.use(verifySocketToken);

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    
    // Track connection
    connectionTracker.addConnection(userId, socket.id);
    
    // Join personal room
    socket.join(`user:${userId}`);
    
    // Join role-based rooms
    const userRoles = socket.user.roles || [socket.user.role];
    if (userRoles.includes('moderator') || userRoles.includes('admin')) {
      socket.join('moderators');
    }
    if (userRoles.includes('admin')) {
      socket.join('admins');
    }

    // Register event handlers
    registerHandlers(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      connectionTracker.removeConnection(userId, socket.id);
    });

    // Handle errors silently
    socket.on('error', () => {});
  });
  
  return io;
};

export const getIO = () => io;

export const shutdownSocket = () => {
  if (io) {
    io.close();
  }
};

export default { initializeSocket, getIO, shutdownSocket };
