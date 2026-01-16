/**
 * ============================================================================
 * SOCKET AUTHENTICATION MIDDLEWARE
 * ============================================================================
 * JWT verification for WebSocket connections
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verify JWT token for socket connection
 * @param {Socket} socket - Socket.io socket instance
 * @param {Function} next - Next middleware function
 */
export const verifySocketToken = async (socket, next) => {
  try {
    // Get token from handshake auth or query
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      console.log('❌ Socket auth failed: No token provided');
      return next(new Error('Authentication required: No token provided'));
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        console.log('❌ Socket auth failed: Token expired');
        return next(new Error('Authentication failed: Token expired'));
      }
      if (jwtError.name === 'JsonWebTokenError') {
        console.log('❌ Socket auth failed: Invalid token');
        return next(new Error('Authentication failed: Invalid token'));
      }
      throw jwtError;
    }

    // Find user in database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.log('❌ Socket auth failed: User not found');
      return next(new Error('Authentication failed: User not found'));
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ Socket auth failed: User account inactive');
      return next(new Error('Authentication failed: Account is inactive'));
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      console.log('❌ Socket auth failed: User account suspended');
      return next(new Error('Authentication failed: Account is suspended'));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`✅ Socket authenticated: ${user.firstName} ${user.lastName} (${user.email})`);
    next();
  } catch (error) {
    console.error('❌ Socket auth error:', error.message);
    next(new Error('Authentication failed: ' + error.message));
  }
};

/**
 * Check if a token is valid (for testing)
 * @param {string} token - JWT token
 * @returns {Object} Validation result
 */
export const validateToken = async (token) => {
  try {
    if (!token) {
      return { valid: false, error: 'No token provided' };
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return { valid: false, error: 'User not found' };
    }

    if (!user.isActive) {
      return { valid: false, error: 'Account inactive' };
    }

    if (user.status === 'suspended') {
      return { valid: false, error: 'Account suspended' };
    }

    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

export default {
  verifySocketToken,
  validateToken
};
