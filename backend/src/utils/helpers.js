import { validationResult } from 'express-validator';

/**
 * Format validation errors from express-validator
 * @param {Object} req - Express request object
 * @returns {Array} Array of error messages
 */
export const formatValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
  }
  return [];
};

/**
 * Generate random string
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sanitize user input
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isValid = password.length >= minLength && hasLowerCase && hasNumbers;

  return {
    isValid,
    requirements: {
      minLength: password.length >= minLength,
      hasLowerCase,
      hasUpperCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};

/**
 * Format user data for response (remove sensitive fields)
 * @param {Object} user - User object
 * @returns {Object} Sanitized user data
 */
export const formatUserResponse = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  
  // Remove sensitive fields
  delete userObj.password;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpires;
  delete userObj.loginAttempts;
  delete userObj.lockUntil;
  
  return userObj;
};

/**
 * Generate audit log message
 * @param {string} action - Action performed
 * @param {string} resource - Resource affected
 * @param {string} userId - User ID
 * @returns {string} Audit log message
 */
export const generateAuditMessage = (action, resource, userId) => {
  return `${action} performed on ${resource} by user ${userId}`;
};

/**
 * Calculate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination parameters
 */
export const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

/**
 * Format paginated response
 * @param {Array} data - Data array
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Paginated response
 */
export const formatPaginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    pagination: {
      current: page,
      total: totalPages,
      count: data.length,
      totalCount: total,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : null,
      prevPage: hasPrev ? page - 1 : null
    }
  };
};