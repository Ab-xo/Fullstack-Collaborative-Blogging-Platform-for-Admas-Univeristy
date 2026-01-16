import jwt from 'jsonwebtoken';

// Helper function to get JWT secrets at runtime
const getJwtAccessSecret = () => process.env.JWT_ACCESS_SECRET || 'test-access-secret-key';
const getJwtRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key';
const getAccessTokenExpiresIn = () => process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const getRefreshTokenExpiresIn = () => process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

/**
 * Generate JWT access token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    getJwtAccessSecret(), 
    { 
      expiresIn: getAccessTokenExpiresIn(),
      issuer: 'admas-blog-api',
      audience: 'admas-blog-client'
    }
  );
};

/**
 * Generate JWT refresh token
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    getJwtRefreshSecret(), 
    { 
      expiresIn: getRefreshTokenExpiresIn(),
      issuer: 'admas-blog-api',
      audience: 'admas-blog-client'
    }
  );
};

/**
 * Verify JWT access token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, getJwtAccessSecret());
};

/**
 * Verify JWT refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, getJwtRefreshSecret());
};

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} Token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};