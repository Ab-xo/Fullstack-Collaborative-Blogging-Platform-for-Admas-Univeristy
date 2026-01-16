import { body, param, query } from 'express-validator';
import { formatValidationErrors } from '../utils/helpers.js';

// User registration validation
export const validateRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage('First name can only contain letters, spaces, and hyphens'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage('Last name can only contain letters, spaces, and hyphens'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter and one number'),

  body('roleApplication')
    .isIn(['student', 'faculty', 'alumni', 'staff'])
    .withMessage('Please select a valid role application'),

  body('universityId')
    .trim()
    .notEmpty()
    .withMessage('University ID is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('University ID must be between 3 and 20 characters'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),

  body('yearOfStudy')
    .if(body('roleApplication').equals('student'))
    .notEmpty()
    .withMessage('Year of study is required for students')
    .trim()
    .isLength({ max: 20 })
    .withMessage('Year of study cannot exceed 20 characters'),

  body('position')
    .if(body('roleApplication').equals('faculty'))
    .notEmpty()
    .withMessage('Position is required for faculty')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),

  body('graduationYear')
    .if(body('roleApplication').equals('alumni'))
    .notEmpty()
    .withMessage('Graduation year is required for alumni')
    .trim()
    .isLength({ max: 4 })
    .withMessage('Graduation year must be 4 characters')
    .isNumeric()
    .withMessage('Graduation year must be a number'),

  body('verificationDocument')
    .if(body('roleApplication').equals('alumni'))
    .notEmpty()
    .withMessage('Verification document is required for alumni')
    .trim()
    .isLength({ max: 255 })
    .withMessage('Verification document cannot exceed 255 characters')
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];
// User preferences validation
export const validatePreferences = [
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean value'),

  body('pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be a boolean value'),

  body('language')
    .optional()
    .isIn(['en', 'am', 'om', 'ti'])
    .withMessage('Language must be one of: en, am, om, ti'),

  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be one of: light, dark, auto')
];

// Role application update validation
export const validateRoleApplicationUpdate = [
  body('roleApplication')
    .optional()
    .isIn(['student', 'faculty', 'alumni', 'staff'])
    .withMessage('Please select a valid role application'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),

  body('yearOfStudy')
    .if(body('roleApplication').equals('student'))
    .notEmpty()
    .withMessage('Year of study is required for students')
    .trim()
    .isLength({ max: 20 })
    .withMessage('Year of study cannot exceed 20 characters'),

  body('position')
    .if(body('roleApplication').equals('faculty'))
    .notEmpty()
    .withMessage('Position is required for faculty')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),

  body('graduationYear')
    .if(body('roleApplication').equals('alumni'))
    .notEmpty()
    .withMessage('Graduation year is required for alumni')
    .trim()
    .isLength({ max: 4 })
    .withMessage('Graduation year must be 4 characters')
    .isNumeric()
    .withMessage('Graduation year must be a number'),

  body('verificationDocument')
    .if(body('roleApplication').equals('alumni'))
    .notEmpty()
    .withMessage('Verification document is required for alumni')
    .trim()
    .isLength({ max: 255 })
    .withMessage('Verification document cannot exceed 255 characters')
];
// User profile update validation
export const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage('First name can only contain letters, spaces, and hyphens'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage('Last name can only contain letters, spaces, and hyphens'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('contactInfo.phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('contactInfo.website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('socialMedia.twitter')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid Twitter URL'),

  body('socialMedia.linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),

  body('socialMedia.github')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid GitHub URL')
];

// Change password validation
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter and one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
];

// Blog post validation (for future use)
export const validateBlogPost = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('Cannot have more than 10 tags');
      }
      return true;
    })
];
// Email verification validation
export const validateEmailVerification = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification token must be 6 digits')
    .isNumeric()
    .withMessage('Verification token must contain only numbers')
];

// Password reset validation
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Reset token must be 6 digits')
    .isNumeric()
    .withMessage('Reset token must contain only numbers'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter and one number')
];

// User approval validation
export const validateUserApproval = [
  body('roles')
    .optional()
    .isArray()
    .withMessage('Roles must be an array')
    .custom((roles) => {
      const validRoles = ['admin', 'moderator', 'author', 'reader'];
      return roles.every(role => validRoles.includes(role));
    })
    .withMessage('Invalid role provided'),

  body('reviewNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review notes cannot exceed 500 characters')
];

// ID parameter validation
export const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

// Query parameter validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Validation error handler middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = formatValidationErrors(req);
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};