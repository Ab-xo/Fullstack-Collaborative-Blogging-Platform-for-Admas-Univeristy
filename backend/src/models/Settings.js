import mongoose from 'mongoose';

/**
 * System Settings Model
 * Stores platform-wide configuration settings
 */
const settingsSchema = new mongoose.Schema({
  // Use a single document approach with a fixed key
  key: {
    type: String,
    default: 'system_settings',
    unique: true,
    immutable: true
  },
  
  // General Settings
  general: {
    siteName: {
      type: String,
      default: 'Admas University Blog'
    },
    siteDescription: {
      type: String,
      default: 'A collaborative blogging platform for Admas University'
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    allowRegistration: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    defaultUserRole: {
      type: String,
      enum: ['reader', 'author'],
      default: 'reader'
    }
  },
  
  // Moderation Settings
  moderation: {
    autoApproveVerifiedUsers: {
      type: Boolean,
      default: false
    },
    requirePostApproval: {
      type: Boolean,
      default: true
    },
    enableAIModeration: {
      type: Boolean,
      default: true
    },
    maxPostsPerDay: {
      type: Number,
      default: 10,
      min: 1,
      max: 100
    },
    maxCommentsPerDay: {
      type: Number,
      default: 50,
      min: 1,
      max: 500
    }
  },
  
  // Email Settings
  email: {
    fromEmail: {
      type: String,
      default: 'noreply@admas.edu'
    },
    sendWelcomeEmail: {
      type: Boolean,
      default: true
    },
    sendApprovalEmail: {
      type: Boolean,
      default: true
    },
    sendRejectionEmail: {
      type: Boolean,
      default: true
    }
  },
  
  // Security Settings
  security: {
    sessionTimeout: {
      type: Number,
      default: 24, // hours
      min: 1,
      max: 168 // 1 week
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 3,
      max: 10
    },
    lockoutDuration: {
      type: Number,
      default: 30, // minutes
      min: 5,
      max: 1440 // 24 hours
    },
    requireStrongPassword: {
      type: Boolean,
      default: true
    },
    enableTwoFactor: {
      type: Boolean,
      default: false
    }
  },
  
  // Audit Settings
  audit: {
    enabled: {
      type: Boolean,
      default: true
    },
    retentionDays: {
      type: Number,
      default: 90,
      min: 7,
      max: 365
    },
    logLoginAttempts: {
      type: Boolean,
      default: true
    },
    logProfileChanges: {
      type: Boolean,
      default: true
    },
    logAdminActions: {
      type: Boolean,
      default: true
    }
  },
  
  // Last updated info
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to get settings (creates default if not exists)
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ key: 'system_settings' });
  
  if (!settings) {
    settings = await this.create({ key: 'system_settings' });
    console.log('✅ Default system settings created');
  }
  
  return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function(updates, userId) {
  const settings = await this.getSettings();
  
  // Update each section if provided
  if (updates.general) {
    Object.assign(settings.general, updates.general);
  }
  if (updates.moderation) {
    Object.assign(settings.moderation, updates.moderation);
  }
  if (updates.email) {
    Object.assign(settings.email, updates.email);
  }
  if (updates.security) {
    Object.assign(settings.security, updates.security);
  }
  if (updates.audit) {
    Object.assign(settings.audit, updates.audit);
  }
  
  settings.updatedBy = userId;
  settings.updatedAt = new Date();
  
  await settings.save();
  return settings;
};

// Instance method to check if SMTP is configured
settingsSchema.methods.isSmtpConfigured = function() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
