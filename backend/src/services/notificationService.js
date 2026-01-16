import Notification from '../models/Notification.js';
import socketService from './socketService.js';

/**
 * Notification Service
 * Handles creating notifications for various events
 * Now includes real-time socket event emission
 */
class NotificationService {
  /**
   * Helper to emit notification and update count
   * @param {string} userId - Recipient user ID
   * @param {Object} notification - Notification object
   */
  static async emitNotification(userId, notification) {
    try {
      // Emit the new notification
      socketService.sendNotification(userId.toString(), notification);

      // Update unread count
      const count = await Notification.countDocuments({
        recipient: userId,
        read: false
      });
      socketService.updateNotificationCount(userId.toString(), count);
    } catch (error) {
      console.error('Error emitting socket notification:', error);
    }
  }

  /**
   * Create a notification for when someone likes a post
   */
  static async notifyPostLike(post, likerId, likerName) {
    // Don't notify if user likes their own post
    if (post.author.toString() === likerId.toString()) return null;

    const notification = await Notification.createNotification({
      recipient: post.author,
      sender: likerId,
      type: 'like',
      title: 'New Like',
      message: `${likerName} liked your post "${post.title}"`,
      relatedPost: post._id,
      link: `/posts/${post._id}`
    });

    // Emit real-time notification
    await this.emitNotification(post.author, notification);

    return notification;
  }

  /**
   * Create a notification for when someone dislikes a post
   */
  static async notifyPostDislike(post, dislikerId, dislikerName) {
    // Don't notify if user dislikes their own post
    if (post.author.toString() === dislikerId.toString()) return null;

    const notification = await Notification.createNotification({
      recipient: post.author,
      sender: dislikerId,
      type: 'dislike',
      title: 'New Feedback',
      message: `${dislikerName} gave feedback on your post "${post.title}"`,
      relatedPost: post._id,
      link: `/posts/${post._id}`
    });

    // Emit real-time notification
    await this.emitNotification(post.author, notification);

    return notification;
  }

  /**
   * Create a notification for when someone comments on a post
   */
  static async notifyPostComment(post, commenterId, commenterName, commentPreview) {
    // Don't notify if user comments on their own post
    if (post.author.toString() === commenterId.toString()) return null;

    const preview = commentPreview.length > 50
      ? commentPreview.substring(0, 50) + '...'
      : commentPreview;

    const notification = await Notification.createNotification({
      recipient: post.author,
      sender: commenterId,
      type: 'comment',
      title: 'New Comment',
      message: `${commenterName} commented on your post: "${preview}"`,
      relatedPost: post._id,
      link: `/posts/${post._id}#comments`
    });

    // Emit real-time notification
    await this.emitNotification(post.author, notification);

    return notification;
  }

  /**
   * Create a notification for when someone replies to a comment
   */
  static async notifyCommentReply(comment, replierId, replierName, replyPreview) {
    // Don't notify if user replies to their own comment
    if (comment.author.toString() === replierId.toString()) return null;

    const preview = replyPreview.length > 50
      ? replyPreview.substring(0, 50) + '...'
      : replyPreview;

    const notification = await Notification.createNotification({
      recipient: comment.author,
      sender: replierId,
      type: 'reply',
      title: 'New Reply',
      message: `${replierName} replied to your comment: "${preview}"`,
      relatedComment: comment._id,
      relatedPost: comment.post,
      link: `/posts/${comment.post}#comment-${comment._id}`
    });

    // Emit real-time notification
    await this.emitNotification(comment.author, notification);

    return notification;
  }

  /**
   * Create a notification when a post is approved
   */
  static async notifyPostApproved(post, moderatorId) {
    const notification = await Notification.createNotification({
      recipient: post.author,
      sender: moderatorId,
      type: 'post_approved',
      title: 'Post Approved! 🎉',
      message: `Your post "${post.title}" has been approved and is now published.`,
      relatedPost: post._id,
      link: `/posts/${post._id}`,
      priority: 'high'
    });

    // Emit real-time notification
    await this.emitNotification(post.author, notification);

    return notification;
  }

  /**
   * Create a notification when a post is rejected
   */
  static async notifyPostRejected(post, moderatorId, reason) {
    const notification = await Notification.createNotification({
      recipient: post.author,
      sender: moderatorId,
      type: 'post_rejected',
      title: 'Post Needs Revision',
      message: `Your post "${post.title}" needs revision. ${reason || 'Please check the feedback.'}`,
      relatedPost: post._id,
      link: `/posts/${post._id}/edit`,
      priority: 'high'
    });

    // Emit real-time notification
    await this.emitNotification(post.author, notification);

    return notification;
  }

  /**
   * Create a notification for new followers
   */
  static async notifyNewFollower(userId, followerId, followerName) {
    const notification = await Notification.createNotification({
      recipient: userId,
      sender: followerId,
      type: 'follow',
      title: 'New Follower',
      message: `${followerName} started following you`,
      // No link since profile page doesn't exist yet
      link: null
    });

    // Emit real-time notification
    await this.emitNotification(userId, notification);

    return notification;
  }

  /**
   * Create a welcome notification for new users
   */
  static async notifyWelcome(userId, userName) {
    return Notification.createNotification({
      recipient: userId,
      type: 'welcome',
      title: 'Welcome to Admas Blog! 🎉',
      message: `Hi ${userName}! Welcome to the Admas University Blog community. Start exploring and sharing your stories!`,
      link: '/blogs',
      priority: 'high'
    });
  }

  /**
   * Create a system notification
   */
  static async notifySystem(userId, title, message, link = null) {
    return Notification.createNotification({
      recipient: userId,
      type: 'system',
      title,
      message,
      link
    });
  }

  /**
   * Notify followers when an author publishes a new post
   */
  static async notifyFollowersNewPost(authorId, authorName, post, followerIds) {
    if (!followerIds || followerIds.length === 0) return null;

    const notifications = followerIds.map(followerId => ({
      recipient: followerId,
      sender: authorId,
      type: 'post_published',
      title: 'New Post 📝',
      message: `${authorName} published a new post: "${post.title}"`,
      relatedPost: post._id,
      link: `/posts/${post._id}`
    }));

    const result = await Notification.insertMany(notifications);

    // Emit real-time notifications to all followers
    for (const followerId of followerIds) {
      const notification = result.find(n => n.recipient.toString() === followerId.toString());
      if (notification) {
        await this.emitNotification(followerId, notification);
      }
    }

    return result;
  }

  /**
   * Notify moderators and admins when a new post needs review
   */
  static async notifyModeratorsNewPost(post, authorName, moderatorIds) {
    if (!moderatorIds || moderatorIds.length === 0) return null;

    const notifications = moderatorIds.map(moderatorId => ({
      recipient: moderatorId,
      type: 'pending_review',
      title: 'New Post Pending Review 📋',
      message: `${authorName} submitted a new post for review: "${post.title}"`,
      relatedPost: post._id,
      link: '/admin/posts?status=pending',
      priority: 'high'
    }));

    const result = await Notification.insertMany(notifications);

    // Emit real-time notifications to all moderators
    for (const moderatorId of moderatorIds) {
      const notification = result.find(n => n.recipient.toString() === moderatorId.toString());
      if (notification) {
        await this.emitNotification(moderatorId, notification);
      }
    }

    // Also emit moderation:new event to moderators room
    socketService.notifyModeratorsNewPost(post, authorName);

    return result;
  }

  /**
   * Notify admin when a new user registers
   */
  static async notifyAdminNewUser(adminIds, newUser) {
    if (!adminIds || adminIds.length === 0) {
      console.log('notifyAdminNewUser: No admin IDs provided');
      return null;
    }

    const userName = `${newUser.firstName} ${newUser.lastName}`;
    console.log(`notifyAdminNewUser: Creating notifications for ${adminIds.length} admins about user: ${userName}`);

    const notifications = adminIds.map(adminId => ({
      recipient: adminId,
      type: 'new_user',
      title: 'New User Registration 👤',
      message: `${userName} has registered and is awaiting approval.`,
      link: '/admin/users?status=pending',
      priority: 'normal',
      read: false
    }));

    console.log('notifyAdminNewUser: Notification objects:', JSON.stringify(notifications, null, 2));

    try {
      const result = await Notification.insertMany(notifications);
      console.log(`notifyAdminNewUser: Successfully created ${result.length} notifications`);

      // Emit real-time notifications to all admins
      for (const adminId of adminIds) {
        const notification = result.find(n => n.recipient.toString() === adminId.toString());
        if (notification) {
          await this.emitNotification(adminId, notification);
        }
      }

      return result;
    } catch (error) {
      console.error('notifyAdminNewUser: Error creating notifications:', error);
      throw error;
    }
  }

  /**
   * Notify admin when a user requests author status
   */
  static async notifyAdminAuthorRequest(adminIds, user) {
    if (!adminIds || adminIds.length === 0) return null;

    const userName = `${user.firstName} ${user.lastName}`;

    const notifications = adminIds.map(adminId => ({
      recipient: adminId,
      type: 'author_request',
      title: 'New Author Application 📝',
      message: `${userName} has verified their email and is requesting Author access.`,
      link: '/admin/authors/pending',
      priority: 'high'
    }));

    try {
      const result = await Notification.insertMany(notifications);

      // Emit real-time notifications to all admins
      for (const adminId of adminIds) {
        const notification = result.find(n => n.recipient.toString() === adminId.toString());
        if (notification) {
          await this.emitNotification(adminId, notification);
        }
      }

      return result;
    } catch (error) {
      console.error('notifyAdminAuthorRequest: Error creating notifications:', error);
      throw error;
    }
  }

  /**
   * Notify user when their account is approved
   */
  static async notifyAccountApproved(userId) {
    const notification = await Notification.createNotification({
      recipient: userId,
      type: 'account_approved',
      title: 'Account Approved! 🎉',
      message: 'Your account has been approved. You can now create and publish posts!',
      link: '/posts/create',
      priority: 'high'
    });

    // Emit real-time notification
    await this.emitNotification(userId, notification);

    return notification;
  }

  /**
   * Notify user when their account is rejected
   */
  static async notifyAccountRejected(userId, reason) {
    const notification = await Notification.createNotification({
      recipient: userId,
      type: 'account_rejected',
      title: 'Account Application Update',
      message: reason || 'Your account application was not approved. Please contact support for more information.',
      priority: 'high'
    });

    // Emit real-time notification
    await this.emitNotification(userId, notification);

    return notification;
  }

  /**
   * Notify moderators about reported content
   */
  static async notifyModeratorsReport(moderatorIds, reportType, contentTitle, reporterId) {
    if (!moderatorIds || moderatorIds.length === 0) return null;

    const notifications = moderatorIds.map(moderatorId => ({
      recipient: moderatorId,
      sender: reporterId,
      type: 'content_report',
      title: 'Content Reported ⚠️',
      message: `A ${reportType} has been reported: "${contentTitle}"`,
      link: '/admin/reports',
      priority: 'high'
    }));

    const result = await Notification.insertMany(notifications);

    // Emit real-time notifications to all moderators
    for (const moderatorId of moderatorIds) {
      const notification = result.find(n => n.recipient.toString() === moderatorId.toString());
      if (notification) {
        await this.emitNotification(moderatorId, notification);
      }
    }

    return result;
  }

  /**
   * Notify moderators about content violations detected during writing
   * @param {Array} moderatorIds - Array of moderator user IDs
   * @param {Object} violationData - Violation details
   */
  static async notifyModeratorsViolation(moderatorIds, violationData) {
    if (!moderatorIds || moderatorIds.length === 0) return null;

    const { authorId, authorName, title, severity, violations } = violationData;
    const violationCount = violations?.length || 0;
    const severityLabel = severity?.toUpperCase() || 'UNKNOWN';

    const notifications = moderatorIds.map(moderatorId => ({
      recipient: moderatorId,
      sender: authorId,
      type: 'violation_alert',
      title: `⚠️ ${severityLabel} Violation Detected`,
      message: `${authorName} is writing content with ${violationCount} potential violation(s): "${title?.substring(0, 50)}${title?.length > 50 ? '...' : ''}"`,
      link: '/admin/posts?status=pending',
      priority: severity === 'critical' || severity === 'high' ? 'high' : 'normal'
    }));

    const result = await Notification.insertMany(notifications);

    // Emit real-time notifications to all moderators
    for (const moderatorId of moderatorIds) {
      const notification = result.find(n => n.recipient.toString() === moderatorId.toString());
      if (notification) {
        await this.emitNotification(moderatorId, notification);
      }
    }

    // Also emit real-time violation alert via socket
    socketService.notifyModeratorsViolation({
      authorId,
      authorName,
      title,
      severity,
      violations,
      violationCount
    });

    return result;
  }
}

export default NotificationService;
