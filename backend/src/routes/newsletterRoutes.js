import express from 'express';
import {
  subscribe,
  unsubscribe,
  updatePreferences,
  getStats,
  getAllSubscribers
} from '../controllers/newsletterController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Newsletter Routes
 * 
 * Public routes:
 * - POST /subscribe - Subscribe to newsletter
 * - POST /unsubscribe - Unsubscribe from newsletter
 * - GET /stats - Get subscriber count
 * 
 * Protected routes (admin only):
 * - GET /subscribers - Get all subscribers
 * - PUT /preferences - Update preferences
 */

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/stats', getStats);

// Protected routes
router.put('/preferences', protect, updatePreferences);
router.get('/subscribers', protect, restrictTo('admin'), getAllSubscribers);

export default router;
