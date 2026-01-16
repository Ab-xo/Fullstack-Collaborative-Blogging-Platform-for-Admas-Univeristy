import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      'user_registered',
      'user_approved',
      'user_rejected',
      'user_suspended',
      'user_activated',
      'user_deleted',
      'role_updated',
      'login',
      'logout',
      'password_changed',
      'email_verified',
      'password_reset_requested',
      'password_reset',
      'profile_updated',
      'avatar_uploaded',
      'account_deleted',
      'settings_updated',
      'post_created',
      'post_updated',
      'post_deleted',
      'post_approved',
      'post_rejected',
      'post_reviewed',
      'review_requested',
      'ai_suggestion_requested',
      'ai_grammar_check',
      'ai_improvement_requested',
      'ai_topics_generated',
      'ai_chat_interaction',
      'collaboration_invited',
      'collaboration_accepted',
      'collaboration_declined',
      'collaboration_left',
      'comment_created',
      'comment_deleted',
      'program_created',
      'program_updated',
      'program_deleted',
      'program_reordered'
    ]
  },

  // Resource details
  resourceType: {
    type: String,
    required: true,
    enum: ['user', 'auth', 'system', 'profile', 'post', 'comment', 'settings', 'ai', 'review', 'collaboration', 'program']
  },

  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // User who performed the action
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Action metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // IP address and user agent
  ipAddress: {
    type: String,
    default: 'Unknown'
  },

  userAgent: {
    type: String,
    default: 'Unknown'
  },

  // Additional context
  description: {
    type: String,
    maxlength: 500
  },

  // Success status
  success: {
    type: Boolean,
    default: true
  },

  // Error information if action failed
  error: {
    message: String,
    stack: String
  },

  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ ipAddress: 1 });
auditLogSchema.index({ success: 1 });

// Virtual for formatted action description
auditLogSchema.virtual('formattedAction').get(function () {
  const actionMap = {
    'user_registered': 'User Registration',
    'user_approved': 'User Approval',
    'user_rejected': 'User Rejection',
    'user_suspended': 'User Suspension',
    'user_activated': 'User Activation',
    'user_deleted': 'User Deletion',
    'role_updated': 'Role Update',
    'login': 'User Login',
    'logout': 'User Logout',
    'password_changed': 'Password Change',
    'email_verified': 'Email Verification',
    'password_reset_requested': 'Password Reset Request',
    'password_reset': 'Password Reset',
    'profile_updated': 'Profile Update',
    'avatar_uploaded': 'Avatar Upload',
    'account_deleted': 'Account Deletion',
    'settings_updated': 'Settings Update',
    'post_created': 'Post Created',
    'post_updated': 'Post Updated',
    'post_deleted': 'Post Deleted',
    'post_approved': 'Post Approved',
    'post_rejected': 'Post Rejected',
    'post_reviewed': 'Post Reviewed',
    'review_requested': 'Review Requested',
    'ai_suggestion_requested': 'AI Content Suggestion',
    'ai_grammar_check': 'AI Grammar Check',
    'ai_improvement_requested': 'AI Content Improvement',
    'ai_topics_generated': 'AI Topics Generated',
    'ai_chat_interaction': 'AI Chat Interaction',
    'collaboration_invited': 'Collaboration Invited',
    'collaboration_accepted': 'Collaboration Accepted',
    'collaboration_declined': 'Collaboration Declined',
    'collaboration_left': 'Collaboration Left',
    'comment_created': 'Comment Created',
    'comment_deleted': 'Comment Deleted',
    'program_created': 'Program Created',
    'program_updated': 'Program Updated',
    'program_deleted': 'Program Deleted',
    'program_reordered': 'Programs Reordered'
  };

  return actionMap[this.action] || this.action;
});

// Static methods
auditLogSchema.statics.logAction = async function (actionData) {
  try {
    const auditLog = new this(actionData);
    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('❌ Error creating audit log:', error);
    throw error;
  }
};

auditLogSchema.statics.getUserActivity = function (userId, limit = 50) {
  return this.find({ performedBy: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('performedBy', 'firstName lastName email roles profile.avatar')
    .lean();
};

auditLogSchema.statics.getRecentActivity = function (days = 7, limit = 100) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return this.find({ timestamp: { $gte: date } })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('performedBy', 'firstName lastName email roles profile.avatar')
    .lean();
};

auditLogSchema.statics.getSystemStats = function (days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: date }
      }
    },
    {
      $facet: {
        activityByDay: [
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ],
        activityByType: [
          {
            $group: {
              _id: '$action',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],
        activityByUser: [
          {
            $group: {
              _id: '$performedBy',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        failedActions: [
          {
            $match: {
              success: false
            }
          },
          {
            $group: {
              _id: '$action',
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);
};

auditLogSchema.statics.cleanupOldLogs = async function (daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });

  console.log(`🧹 Cleaned up ${result.deletedCount} audit logs older than ${daysToKeep} days`);
  return result;
};

// Instance methods
auditLogSchema.methods.toJSON = function () {
  const auditLog = this.toObject();

  // Remove sensitive error stack traces in production
  if (process.env.NODE_ENV === 'production' && auditLog.error) {
    delete auditLog.error.stack;
  }

  return auditLog;
};

// Middleware to automatically add description if not provided
auditLogSchema.pre('save', function (next) {
  if (!this.description) {
    this.description = `${this.formattedAction} performed on ${this.resourceType}`;
  }
  next();
});

export default mongoose.model('AuditLog', auditLogSchema);