import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  
  const userId = req.user._id;
  console.log(`getNotifications: Fetching for user ID: ${userId} (type: ${typeof userId})`);
  
  const query = { recipient: userId };
  if (unreadOnly === 'true') {
    query.read = false;
  }
  
  console.log('getNotifications: Query:', JSON.stringify(query));
  
  // First check total notifications in DB for this user
  const allNotificationsForUser = await Notification.find({ recipient: userId });
  console.log(`getNotifications: Total notifications in DB for user: ${allNotificationsForUser.length}`);
  
  const notifications = await Notification.find(query)
    .populate('sender', 'firstName lastName profile.avatar')
    .populate('relatedPost', 'title slug')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
  
  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.getUnreadCount(userId);
  
  console.log(`getNotifications: Found ${notifications.length} notifications, ${unreadCount} unread, total: ${total}`);
  
  res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user._id);
  
  res.status(200).json({
    success: true,
    count
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
  
  await notification.markAsRead();
  
  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.markAllAsRead(req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id
  });
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Notification deleted'
  });
});

// @desc    Delete all notifications
// @route   DELETE /api/notifications/all
// @access  Private
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });
  
  res.status(200).json({
    success: true,
    message: 'All notifications deleted'
  });
});

// @desc    Create notification (internal use / admin)
// @route   POST /api/notifications
// @access  Private (Admin)
export const createNotification = asyncHandler(async (req, res) => {
  const { recipientId, type, title, message, link, priority } = req.body;
  
  const notification = await Notification.createNotification({
    recipient: recipientId,
    sender: req.user._id,
    type,
    title,
    message,
    link,
    priority
  });
  
  res.status(201).json({
    success: true,
    data: notification
  });
});
