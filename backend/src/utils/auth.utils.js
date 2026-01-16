/**
 * Authentication Utilities
 * Helper functions for JWT, tokens, and authentication
 */

import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Send JWT token in response
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
  res.status(statusCode).cookie('jwt', token, cookieOptions).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  });
};
