import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Delete all notifications
router.delete('/all', deleteAllNotifications);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Delete single notification
router.delete('/:id', deleteNotification);

// Create notification (admin only)
router.post('/', authorize('admin'), createNotification);

export default router;
