import Settings from '../models/Settings.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Cache settings to avoid DB calls on every request
let cachedSettings = null;
let cacheTimestamp = null;
const CACHE_TTL = 60000; // 1 minute cache

// Cache user roles to avoid repeated DB lookups
const userRoleCache = new Map();
const USER_ROLE_CACHE_TTL = 300000; // 5 minutes

/**
 * Get settings with caching
 */
export const getSettings = async () => {
  const now = Date.now();
  
  if (cachedSettings && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedSettings;
  }
  
  try {
    cachedSettings = await Settings.getSettings();
    cacheTimestamp = now;
    return cachedSettings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};

/**
 * Clear settings cache (call after settings update)
 */
export const clearSettingsCache = () => {
  cachedSettings = null;
  cacheTimestamp = null;
};

/**
 * Helper to extract user ID from token and get role from database
 */
const getUserRoleFromToken = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    
    // Use the correct secret - JWT_ACCESS_SECRET
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    
    if (!decoded.id) {
      return null;
    }
    
    // Check cache first
    const now = Date.now();
    const cached = userRoleCache.get(decoded.id);
    if (cached && (now - cached.timestamp) < USER_ROLE_CACHE_TTL) {
      return cached.role;
    }
    
    // Look up user role from database
    const user = await User.findById(decoded.id).select('role roles').lean();
    if (!user) {
      return null;
    }
    
    // Get role - prefer single 'role' field, fallback to first in 'roles' array
    const role = user.role || (user.roles && user.roles[0]) || 'reader';
    
    // Cache the result
    userRoleCache.set(decoded.id, { role, timestamp: now });
    
    return role;
  } catch (error) {
    // Token verification failed - that's okay, user might not be logged in
    return null;
  }
};

/**
 * Middleware to check maintenance mode
 * Admins and moderators have FULL access during maintenance
 * Regular users can only access login and public maintenance status
 */
export const checkMaintenanceMode = async (req, res, next) => {
  try {
    const settings = await getSettings();
    
    if (settings?.general?.maintenanceMode) {
      // Check if user is admin/moderator from req.user (if auth middleware ran)
      // OR look up from database using token
      let userRole = req.user?.role;
      
      if (!userRole) {
        userRole = await getUserRoleFromToken(req);
      }
      
      // Admins and moderators bypass maintenance mode completely
      // They have full control and need access to everything
      if (userRole === 'admin' || userRole === 'moderator') {
        return next();
      }
      
      // Use originalUrl to get the full path including /api prefix
      const fullPath = req.originalUrl || req.url;
      
      // Routes that must work for everyone during maintenance
      // This allows admins to login from the maintenance page
      const publicAllowedPaths = [
        '/api/auth/login',
        '/api/auth/logout',
        '/api/auth/me',
        '/api/auth/refresh-token',
        '/api/health',
        '/api/public/maintenance-status',
        // Also check without /api prefix in case of different mount points
        '/auth/login',
        '/auth/logout',
        '/auth/me',
        '/auth/refresh-token',
        '/health',
        '/public/maintenance-status'
      ];
      
      // Check if it's a public allowed path
      const isPublicAllowed = publicAllowedPaths.some(path => 
        fullPath.startsWith(path) || req.path.startsWith(path)
      );
      
      if (isPublicAllowed) {
        return next();
      }
      
      // For all other routes, block non-admin/moderator users
      return res.status(503).json({
        success: false,
        message: 'The platform is currently under maintenance. Please try again later.',
        maintenanceMode: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Maintenance mode check error:', error);
    next(); // Don't block on error
  }
};

/**
 * Middleware to check if registration is allowed
 */
export const checkRegistrationAllowed = async (req, res, next) => {
  try {
    const settings = await getSettings();
    
    if (settings?.general?.allowRegistration === false) {
      return res.status(403).json({
        success: false,
        message: 'Registration is currently disabled. Please contact an administrator.',
        registrationDisabled: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Registration check error:', error);
    next(); // Don't block on error
  }
};

/**
 * Middleware to get settings and attach to request
 */
export const attachSettings = async (req, res, next) => {
  try {
    req.systemSettings = await getSettings();
    next();
  } catch (error) {
    console.error('Error attaching settings:', error);
    next();
  }
};

/**
 * Middleware to check post rate limit
 */
export const checkPostRateLimit = async (req, res, next) => {
  try {
    const settings = await getSettings();
    const maxPostsPerDay = settings?.moderation?.maxPostsPerDay || 10;
    
    if (!req.user) {
      return next();
    }
    
    // Import BlogPost model dynamically to avoid circular dependency
    const BlogPost = (await import('../models/BlogPost.js')).default;
    
    // Count posts created by user in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const postCount = await BlogPost.countDocuments({
      author: req.user.id,
      createdAt: { $gte: oneDayAgo }
    });
    
    if (postCount >= maxPostsPerDay) {
      return res.status(429).json({
        success: false,
        message: `You have reached the maximum of ${maxPostsPerDay} posts per day. Please try again tomorrow.`,
        rateLimited: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Post rate limit check error:', error);
    next(); // Don't block on error
  }
};

export default {
  checkMaintenanceMode,
  checkRegistrationAllowed,
  attachSettings,
  checkPostRateLimit,
  clearSettingsCache
};
