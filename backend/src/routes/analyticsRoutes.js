import express from 'express';
import {
  getAdminDashboard,
  getModeratorDashboard,
  getAuthorDashboard,
  getPostTrends,
  getUserActivity,
  getCategoryStats,
  getNetworkInteractions
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Analytics Routes
router.get(
  '/admin/dashboard',
  protect,
  authorize('admin'),
  getAdminDashboard
);

router.get(
  '/users/activity',
  protect,
  authorize('admin'),
  getUserActivity
);

router.get(
  '/network/interactions',
  protect,
  authorize('admin'),
  getNetworkInteractions
);

// Moderator Analytics Routes
router.get(
  '/moderator/dashboard',
  protect,
  authorize('admin', 'moderator'),
  getModeratorDashboard
);

router.get(
  '/posts/trends',
  protect,
  authorize('admin', 'moderator'),
  getPostTrends
);

router.get(
  '/categories/stats',
  protect,
  authorize('admin', 'moderator'),
  getCategoryStats
);

// Author Analytics Routes
router.get(
  '/author/dashboard',
  protect,
  authorize('admin', 'moderator', 'author'),
  getAuthorDashboard
);

export default router;
