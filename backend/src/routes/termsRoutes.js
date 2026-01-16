/**
 * Terms Routes - Terms of Service, Privacy Policy, and Content Guidelines
 */
import express from 'express';
import {
  getCurrentTerms,
  getTermsVersions,
  recordAcceptance,
  getAcceptanceStatus,
  createTerms
} from '../controllers/termsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes - anyone can view terms
router.get('/:type', getCurrentTerms);
router.get('/:type/versions', getTermsVersions);

// Protected routes - require authentication
router.post('/accept', protect, recordAcceptance);
router.get('/user/status', protect, getAcceptanceStatus);

// Admin routes - require admin role
router.post('/', protect, authorize('admin'), createTerms);

export default router;
