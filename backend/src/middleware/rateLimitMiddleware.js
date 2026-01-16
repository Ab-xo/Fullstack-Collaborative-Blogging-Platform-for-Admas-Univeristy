/**
 * ============================================================================
 * ADVANCED RATE LIMITING MIDDLEWARE
 * ============================================================================
 * Comprehensive rate limiting with different tiers for various endpoints
 */

import rateLimit from 'express-rate-limit';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

// ==================== MEMORY-BASED RATE LIMITERS ====================

// Strict limiter for authentication endpoints
const authRateLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 15 * 60, // per 15 minutes
  blockDuration: 30 * 60, // Block for 30 minutes if exceeded
});

// Limiter for post creation (prevent spam)
const postCreationLimiter = new RateLimiterMemory({
  points: 10, // 10 posts
  duration: 60 * 60, // per hour
  blockDuration: 60 * 60, // Block for 1 hour if exceeded
});

// Limiter for comments (prevent spam)
const commentLimiter = new RateLimiterMemory({
  points: 30, // 30 comments
  duration: 60 * 60, // per hour
  blockDuration: 30 * 60, // Block for 30 minutes
});

// Limiter for API calls (general)
const apiLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // per minute
  blockDuration: 60, // Block for 1 minute
});

// Limiter for AI features (expensive operations)
const aiLimiter = new RateLimiterMemory({
  points: 20, // 20 AI requests
  duration: 60 * 60, // per hour
  blockDuration: 60 * 60, // Block for 1 hour
});

// ==================== EXPRESS RATE LIMIT CONFIGURATIONS ====================

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});

/**
 * Strict authentication rate limiter
 */
export const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Post creation rate limiter
 */
export const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 posts per hour
  message: {
    success: false,
    message: 'You have reached the post creation limit. Please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Comment rate limiter
 */
export const commentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 comments per hour
  message: {
    success: false,
    message: 'You have reached the comment limit. Please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI feature rate limiter (keyword suggestions, content analysis)
 */
export const aiFeatureLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 AI requests per hour
  message: {
    success: false,
    message: 'AI feature limit reached. Please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Upload rate limiter
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    success: false,
    message: 'Upload limit reached. Please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset rate limiter
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Search rate limiter
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    success: false,
    message: 'Search limit reached. Please slow down.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== MIDDLEWARE FUNCTIONS ====================

/**
 * Advanced auth rate limiting with memory store
 */
export const advancedAuthLimiter = async (req, res, next) => {
  const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  
  try {
    await authRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    if (rejRes instanceof RateLimiterRes) {
      const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
      res.set('Retry-After', retryAfter);
      res.set('X-RateLimit-Remaining', rejRes.remainingPoints);
      
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Your IP has been temporarily blocked.',
        retryAfter,
        blockedUntil: new Date(Date.now() + rejRes.msBeforeNext).toISOString()
      });
    }
    next(rejRes);
  }
};

/**
 * Advanced post creation rate limiting
 */
export const advancedPostLimiter = async (req, res, next) => {
  const key = req.user?._id?.toString() || req.ip || 'unknown';
  
  try {
    await postCreationLimiter.consume(key);
    next();
  } catch (rejRes) {
    if (rejRes instanceof RateLimiterRes) {
      const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
      res.set('Retry-After', retryAfter);
      
      return res.status(429).json({
        success: false,
        message: 'Post creation limit reached. Please wait before creating more posts.',
        retryAfter,
        remainingPosts: 0
      });
    }
    next(rejRes);
  }
};

/**
 * Advanced comment rate limiting
 */
export const advancedCommentLimiter = async (req, res, next) => {
  const key = req.user?._id?.toString() || req.ip || 'unknown';
  
  try {
    await commentLimiter.consume(key);
    next();
  } catch (rejRes) {
    if (rejRes instanceof RateLimiterRes) {
      const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
      res.set('Retry-After', retryAfter);
      
      return res.status(429).json({
        success: false,
        message: 'Comment limit reached. Please wait before posting more comments.',
        retryAfter
      });
    }
    next(rejRes);
  }
};

/**
 * Advanced AI feature rate limiting
 */
export const advancedAILimiter = async (req, res, next) => {
  const key = req.user?._id?.toString() || req.ip || 'unknown';
  
  try {
    const result = await aiLimiter.consume(key);
    res.set('X-AI-RateLimit-Remaining', result.remainingPoints);
    next();
  } catch (rejRes) {
    if (rejRes instanceof RateLimiterRes) {
      const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
      res.set('Retry-After', retryAfter);
      
      return res.status(429).json({
        success: false,
        message: 'AI feature limit reached. Please try again later.',
        retryAfter
      });
    }
    next(rejRes);
  }
};

/**
 * Sliding window rate limiter for API
 */
export const slidingWindowLimiter = async (req, res, next) => {
  const key = req.ip || 'unknown';
  
  try {
    const result = await apiLimiter.consume(key);
    res.set('X-RateLimit-Remaining', result.remainingPoints);
    res.set('X-RateLimit-Reset', Math.ceil(result.msBeforeNext / 1000));
    next();
  } catch (rejRes) {
    if (rejRes instanceof RateLimiterRes) {
      const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
      res.set('Retry-After', retryAfter);
      res.set('X-RateLimit-Remaining', 0);
      
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please slow down.',
        retryAfter
      });
    }
    next(rejRes);
  }
};

/**
 * Get rate limit status for a user/IP
 */
export const getRateLimitStatus = async (req, res) => {
  const key = req.user?._id?.toString() || req.ip || 'unknown';
  
  try {
    const [authStatus, postStatus, commentStatus, aiStatus] = await Promise.all([
      authRateLimiter.get(key),
      postCreationLimiter.get(key),
      commentLimiter.get(key),
      aiLimiter.get(key)
    ]);

    res.json({
      success: true,
      limits: {
        auth: {
          remaining: authStatus ? 5 - authStatus.consumedPoints : 5,
          resetIn: authStatus ? Math.ceil(authStatus.msBeforeNext / 1000) : 0
        },
        posts: {
          remaining: postStatus ? 10 - postStatus.consumedPoints : 10,
          resetIn: postStatus ? Math.ceil(postStatus.msBeforeNext / 1000) : 0
        },
        comments: {
          remaining: commentStatus ? 30 - commentStatus.consumedPoints : 30,
          resetIn: commentStatus ? Math.ceil(commentStatus.msBeforeNext / 1000) : 0
        },
        ai: {
          remaining: aiStatus ? 20 - aiStatus.consumedPoints : 20,
          resetIn: aiStatus ? Math.ceil(aiStatus.msBeforeNext / 1000) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rate limit status'
    });
  }
};

export default {
  generalLimiter,
  strictAuthLimiter,
  postLimiter,
  commentRateLimiter,
  aiFeatureLimiter,
  uploadLimiter,
  passwordResetLimiter,
  searchLimiter,
  advancedAuthLimiter,
  advancedPostLimiter,
  advancedCommentLimiter,
  advancedAILimiter,
  slidingWindowLimiter,
  getRateLimitStatus
};
