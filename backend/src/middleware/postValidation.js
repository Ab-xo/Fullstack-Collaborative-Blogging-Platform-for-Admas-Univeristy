/**
 * Post Validation Middleware
 * 
 * Provides validation for post-related requests
 */

import { body, query, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value !== undefined ? (typeof error.value === 'string' && error.value.length > 100 ? error.value.substring(0, 100) + '...' : error.value) : undefined
    }));

    console.log('Validation errors:', JSON.stringify(errorDetails, null, 2));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorDetails
    });
  }
  next();
};

/**
 * Valid categories list - must match BlogPost schema
 */
const VALID_CATEGORIES = [
  'accounting', 'finance', 'business-management', 'marketing', 'economics',
  'computer-science', 'programming', 'software-engineering', 'technology', 'innovation',
  'agricultural-economics', 'educational-planning', 'education-management', 'research', 'academic',
  'campus-life', 'events', 'student-clubs', 'sports', 'alumni',
  'career', 'internships', 'opinion', 'news', 'culture', 'programs'
];

/**
 * Validate post creation/update data
 */
export const validatePostData = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .custom((value) => {
      // Strip HTML tags to get actual text length
      const textContent = value.replace(/<[^>]*>/g, '').trim();
      if (textContent.length < 50) {
        throw new Error('Content must be at least 50 characters long (excluding HTML tags)');
      }
      return true;
    }),

  body('excerpt')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(VALID_CATEGORIES)
    .withMessage('Invalid category. Please select a valid category.'),

  body('tags')
    .optional({ checkFalsy: true })
    .custom((tags) => {
      // Handle both array and string formats
      if (typeof tags === 'string') {
        // If it's a comma-separated string, validate each tag
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tagArray.length > 10) {
          throw new Error('Cannot have more than 10 tags');
        }
        for (const tag of tagArray) {
          if (tag.length > 30) {
            throw new Error('Each tag must be max 30 characters');
          }
        }
        return true;
      }
      if (Array.isArray(tags)) {
        if (tags.length > 10) {
          throw new Error('Cannot have more than 10 tags');
        }
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.length > 30) {
            throw new Error('Each tag must be a string with max 30 characters');
          }
        }
      }
      return true;
    }),

  body('featuredImage')
    .optional({ checkFalsy: true })
    .custom((value) => {
      // Allow empty strings
      if (!value || value.trim() === '') {
        return true;
      }
      // Validate URL format
      try {
        new URL(value);
        return true;
      } catch (e) {
        throw new Error('Featured image must be a valid URL');
      }
    }),

  body('metaDescription')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters'),

  body('status')
    .optional()
    .isIn(['draft', 'pending', 'under_review', 'approved', 'published', 'rejected', 'archived'])
    .withMessage('Invalid status'),

  handleValidationErrors
];

/**
 * Validate post update data (all fields optional)
 */
export const validatePostUpdateData = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('content')
    .optional()
    .custom((value) => {
      if (!value) return true;
      // Strip HTML tags to get actual text length
      const textContent = value.replace(/<[^>]*>/g, '').trim();
      if (textContent.length < 50) {
        throw new Error('Content must be at least 50 characters long (excluding HTML tags)');
      }
      return true;
    }),

  body('excerpt')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),

  body('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage('Invalid category. Please select a valid category.'),

  body('tags')
    .optional({ checkFalsy: true })
    .custom((tags) => {
      if (typeof tags === 'string') {
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tagArray.length > 10) {
          throw new Error('Cannot have more than 10 tags');
        }
        for (const tag of tagArray) {
          if (tag.length > 30) {
            throw new Error('Each tag must be max 30 characters');
          }
        }
        return true;
      }
      if (Array.isArray(tags)) {
        if (tags.length > 10) {
          throw new Error('Cannot have more than 10 tags');
        }
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.length > 30) {
            throw new Error('Each tag must be a string with max 30 characters');
          }
        }
      }
      return true;
    }),

  body('featuredImage')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true;
      }
      try {
        new URL(value);
        return true;
      } catch (e) {
        throw new Error('Featured image must be a valid URL');
      }
    }),

  body('metaDescription')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters'),

  body('status')
    .optional()
    .isIn(['draft', 'pending', 'under_review', 'approved', 'published', 'rejected', 'archived'])
    .withMessage('Invalid status'),

  handleValidationErrors
];

/**
 * Validate search parameters
 */
export const validateSearchParams = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('category')
    .optional()
    .custom((value) => {
      if (value === 'all' || VALID_CATEGORIES.includes(value)) {
        return true;
      }
      throw new Error('Invalid category');
    }),

  query('sort')
    .optional()
    .isIn(['relevance', 'newest', 'oldest', 'popular', 'views', 'likes', 'comments', 'recent', 'latest', 'mostViewed', 'mostLiked'])
    .withMessage('Invalid sort option'),

  handleValidationErrors
];

/**
 * Validate pagination parameters
 */
export const validatePaginationParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  handleValidationErrors
];

/**
 * Validate filter parameters
 */
export const validateFilterParams = [
  query('category')
    .optional()
    .custom((value) => {
      if (value === 'all' || VALID_CATEGORIES.includes(value)) {
        return true;
      }
      throw new Error('Invalid category');
    }),

  query('tag')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Tag must be between 1 and 30 characters'),

  query('tags')
    .optional()
    .custom((value) => {
      if (value) {
        const tags = value.split(',');
        if (tags.length > 5) {
          throw new Error('Cannot filter by more than 5 tags');
        }
        for (const tag of tags) {
          if (tag.trim().length === 0 || tag.trim().length > 30) {
            throw new Error('Each tag must be between 1 and 30 characters');
          }
        }
      }
      return true;
    }),

  query('author')
    .optional()
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid author ID');
      }
      return true;
    }),

  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'popular', 'views', 'likes', 'comments', 'title', 'updated', 'recent', 'latest', 'mostViewed', 'mostLiked'])
    .withMessage('Invalid sort option'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (endDate && req.query.startDate) {
        const start = new Date(req.query.startDate);
        const end = new Date(endDate);
        if (end <= start) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validate MongoDB ObjectId or slug parameter
 */
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .custom((value) => {
      // Allow both ObjectId and slug formats
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      const isSlug = /^[a-z0-9-]+$/.test(value);

      if (!isValidObjectId && !isSlug) {
        throw new Error(`Invalid ${paramName} format - must be ObjectId or slug`);
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validate category parameter
 */
export const validateCategoryParam = [
  param('category')
    .isIn(VALID_CATEGORIES)
    .withMessage('Invalid category'),

  handleValidationErrors
];

/**
 * Validate user posts parameters
 */
export const validateUserPostsParams = [
  param('userId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid user ID format');
      }
      return true;
    }),

  query('status')
    .optional()
    .isIn(['draft', 'pending', 'under_review', 'approved', 'published', 'rejected', 'archived'])
    .withMessage('Invalid status'),

  query('category')
    .optional()
    .custom((value) => {
      if (value === 'all' || VALID_CATEGORIES.includes(value)) {
        return true;
      }
      throw new Error('Invalid category');
    }),

  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'title', 'popular', 'views', 'updated'])
    .withMessage('Invalid sort option'),

  handleValidationErrors
];

/**
 * Validate tags query parameters
 */
export const validateTagsParams = [
  handleValidationErrors
];

/**
 * Validate peer review data
 */
export const validateReviewData = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Review content is required')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Review content must be between 5 and 2000 characters'),

  body('status')
    .optional()
    .isIn(['approved', 'changes_requested', 'comment_only'])
    .withMessage('Invalid review status'),

  handleValidationErrors
];

/**
 * Validate collaboration invitation
 */
export const validateInviteData = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid user ID format');
      }
      return true;
    }),

  body('role')
    .optional()
    .isIn(['editor', 'contributor', 'reviewer'])
    .withMessage('Invalid collaboration role'),

  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),

  handleValidationErrors
];
