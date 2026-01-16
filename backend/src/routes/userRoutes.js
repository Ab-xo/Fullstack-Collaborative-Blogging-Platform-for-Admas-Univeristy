import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  getUserActivity,
  changePassword,
  uploadAvatar,
  deleteAccount,
  getPreferences,
  updatePreferences,
  getDashboardStats,
  resendEmailVerification,
  updateRoleApplication
} from '../controllers/userController.js';
import {
  validateUpdateProfile,
  validateChangePassword,
  handleValidationErrors
} from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/upload.js';

const router = express.Router();

// All routes protected
router.use(protect);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', validateUpdateProfile, handleValidationErrors, updateUserProfile);
router.put('/change-password', validateChangePassword, handleValidationErrors, changePassword);
router.post('/upload-avatar', upload.single('avatar'), uploadAvatar);
router.delete('/account', deleteAccount);

// User content routes
router.get('/posts', getUserPosts);
router.get('/activity', getUserActivity);

// Additional user routes
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.get('/dashboard-stats', getDashboardStats);
router.post('/resend-verification', resendEmailVerification);
router.put('/role-application', updateRoleApplication);

export default router;