import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  updateProfile,
  changePassword,
  resendVerification
} from '../controllers/authController.js';
import {
  validateRegistration,
  validateLogin,
  validateEmailVerification,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors
} from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkRegistrationAllowed } from '../middleware/settingsMiddleware.js';

const router = express.Router();

// Import Firebase auth controller
import { googleLogin, googleRegister } from '../controllers/firebaseAuthController.js';

// Public routes
router.post('/register', checkRegistrationAllowed, validateRegistration, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/verify-email', validateEmailVerification, handleValidationErrors, verifyEmail);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.put('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/resend-verification', resendVerification);

// Google authentication routes
router.post('/google-login', googleLogin);
router.post('/google-register', checkRegistrationAllowed, googleRegister);

// Protected routes
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;