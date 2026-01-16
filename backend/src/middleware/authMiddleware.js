/**
 * Authentication & Authorization Middleware
 * Combined and comprehensive auth middleware
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { extractTokenFromHeader } from '../utils/tokens.js';

// ==================== LOGIN ATTEMPT TRACKING ====================

/**
 * Track failed login attempts
 * Stores attempts in memory (consider Redis for production)
 */
const loginAttempts = new Map();
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours
const MAX_ATTEMPTS = 5;

/**
 * Check if account is locked due to failed login attempts
 */
export const checkAccountLock = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) return next();
  
  const attempts = loginAttempts.get(email);
  
  if (attempts && attempts.count >= MAX_ATTEMPTS) {
    const lockExpiry = attempts.lockedUntil;
    
    if (lockExpiry && lockExpiry > Date.now()) {
      const remainingTime = Math.ceil((lockExpiry - Date.now()) / 1000 / 60);
      return res.status(423).json({
        success: false,
        message: `Account locked due to too many failed login attempts. Try again in ${remainingTime} minutes.`
      });
    } else {
      // Lock expired, reset attempts
      loginAttempts.delete(email);
    }
  }
  
  next();
};

/**
 * Increment login attempts on failed login
 */
export const incrementLoginAttempts = (email) => {
  const attempts = loginAttempts.get(email) || { count: 0, lockedUntil: null };
  attempts.count += 1;
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCK_TIME;
  }
  
  loginAttempts.set(email, attempts);
};

/**
 * Reset login attempts on successful login
 */
export const resetLoginAttempts = (email) => {
  loginAttempts.delete(email);
};

// ==================== JWT AUTHENTICATION ====================

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization) {
      token = extractTokenFromHeader(req.headers.authorization);
    }

    // Get token from cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-passwordHash');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token may be invalid.'
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is not active. Please contact administrator.'
        });
      }

      // Check if user changed password after token was issued (if method exists)
      if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          success: false,
          message: 'User recently changed password. Please log in again.'
        });
      }

      // Check if email is verified (if field exists)
      if (user.isEmailVerified !== undefined && !user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email before accessing this resource.'
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please refresh your token.'
        });
      }

      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please log in again.'
        });
      }

      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication middleware'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization) {
      token = extractTokenFromHeader(req.headers.authorization);
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.id).select('-passwordHash');
        
        if (user && user.isActive) {
          // Check email verification if field exists
          const emailVerified = user.isEmailVerified === undefined || user.isEmailVerified;
          // Check password change if method exists
          const passwordNotChanged = !user.changedPasswordAfter || !user.changedPasswordAfter(decoded.iat);
          
          if (emailVerified && passwordNotChanged) {
            req.user = user;
          }
        }
      } catch (jwtError) {
        // Ignore token errors for optional auth
        console.log('Optional auth token error (ignored):', jwtError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// ==================== ROLE-BASED AUTHORIZATION ====================

/**
 * Grant access to specific roles
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Check if user has roles array (old schema) or single role (new schema)
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: `User role ${userRoles.join(', ')} is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Restrict access to specific roles (alias for authorize)
 */
export const restrictTo = (...roles) => authorize(...roles);

/**
 * Check if user is admin
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
  
  if (!userRoles.includes('admin')) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.'
    });
  }
  
  next();
};

/**
 * Check if user is moderator or admin
 */
export const isModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
  
  if (!userRoles.includes('admin') && !userRoles.includes('moderator')) {
    return res.status(403).json({
      success: false,
      message: 'Moderator access required.'
    });
  }
  
  next();
};

/**
 * Check if user is author, moderator, or admin
 */
export const isAuthor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
  
  if (!['admin', 'moderator', 'author'].some(role => userRoles.includes(role))) {
    return res.status(403).json({
      success: false,
      message: 'Author access required.'
    });
  }
  
  next();
};

// ==================== RESOURCE OWNERSHIP ====================

/**
 * Check if user is the owner of the resource or has admin role
 * @param {string} resourceOwnerField - Field name containing owner ID (default: 'user')
 */
export const isOwnerOrAdmin = (resourceOwnerField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];

    // Allow if user is admin
    if (userRoles.includes('admin')) {
      return next();
    }

    // Allow if user is the owner of the resource
    const resourceOwnerId = req.params[resourceOwnerField] || req.body[resourceOwnerField];
    
    if (resourceOwnerId && resourceOwnerId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  };
};

// ==================== INPUT VALIDATION ====================

/**
 * Validate password strength
 */
export const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required.'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }
  
  next();
};

/**
 * Validate email format
 */
export const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.'
    });
  }
  
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }
  
  next();
};

/**
 * Validate username format
 */
export const validateUsername = (req, res, next) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({
      success: false,
      message: 'Username is required.'
    });
  }
  
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({
      success: false,
      message: 'Username must be between 3 and 30 characters.'
    });
  }
  
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      success: false,
      message: 'Username can only contain letters, numbers, underscores, and hyphens.'
    });
  }
  
  next();
};
