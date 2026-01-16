import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Recipient of the notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Who triggered the notification (optional - system notifications won't have this)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Type of notification
  type: {
    type: String,
    required: true,
    enum: [
      'like',             // Someone liked your post
      'dislike',          // Someone disliked your post
      'comment',          // Someone commented on your post
      'reply',            // Someone replied to your comment
      'follow',           // Someone followed you
      'mention',          // Someone mentioned you
      'post_approved',    // Your post was approved
      'post_rejected',    // Your post was rejected
      'post_published',   // A followed author published a new post
      'pending_review',   // New post needs moderator review
      'new_user',         // New user registration (for admins)
      'account_approved', // User account approved
      'account_rejected', // User account rejected
      'content_report',   // Content reported (for moderators)
      'contact_message',  // New contact form submission (for admins)
      'collaboration_invite',   // Invited to collaborate on a post
      'collaboration_accepted', // Collaboration invitation accepted
      'collaboration_declined', // Collaboration invitation declined
      'collaboration_removed',  // Removed from collaboration
      'collaboration_left',     // Collaborator left the post
      'system',           // System notification
      'welcome'           // Welcome notification for new users
    ]
  },
  
  // Title of the notification
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  // Message content
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Related content (post, comment, etc.)
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost'
  },
  
  relatedComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  
  // Link to navigate to when clicked
  link: {
    type: String
  },
  
  // Read status
  read: {
    type: Boolean,
    default: false
  },
  
  // Email sent status
  emailSent: {
    type: Boolean,
    default: false
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  
  // Metadata for additional info
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = await this.create(data);
  return notification.populate(['sender', 'relatedPost']);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
