import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Model - Clean Version
 * Core authentication fields only
 * Business logic moved to middleware and controllers
 */

const userSchema = new mongoose.Schema(
  {
    // Username is optional - can be added later when editing profile
    username: {
      type: String,
      unique: true,
      sparse: true,  // Allows null/undefined values to be non-unique
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },

    passwordHash: {
      type: String,
      select: false  // Never return password in queries by default
    },

    // Backward compatibility with old schema
    password: {
      type: String,
      select: false
    },

    firstName: String,
    lastName: String,
    status: String,
    roles: [String],
    isEmailVerified: Boolean,
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // University affiliation fields
    roleApplication: {
      type: String,
      enum: ['student', 'faculty', 'alumni', 'staff']
    },
    universityId: {
      type: String,
      unique: true,
      sparse: true // Allows null/undefined to be non-unique
    },
    department: String,
    yearOfStudy: String,
    position: String,
    graduationYear: String,

    // ID tracking fields for structured IDs
    idSequence: {
      type: Number,
      min: 1,
      max: 9999
    },
    idYear: {
      type: Number,
      min: 2000,
      max: 2100
    },

    // Verification status for alumni
    verificationStatus: {
      type: String,
      enum: ['pending_verification', 'approved', 'rejected', 'not_required'],
      default: 'not_required'
    },

    // Verification document details (enhanced from simple string)
    verificationDocument: {
      type: {
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        filename: String,
        uploadedAt: Date,
        reviewedAt: Date,
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rejectionReason: String
      },
      default: null
    },

    // Author Application Fields
    authorApplicationStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none'
    },
    authorApplicationDate: Date,
    authorApplicationReason: String,

    // Profile fields (old schema)
    profile: {
      type: {
        bio: { type: String, maxlength: 500, default: '' },
        avatar: { type: String, default: '' },
        contactInfo: {
          phone: String,
          website: String
        },
        socialMedia: {
          twitter: String,
          linkedin: String,
          github: String,
          website: String
        }
      },
      default: () => ({
        bio: '',
        avatar: '',
        contactInfo: {},
        socialMedia: {}
      })
    },

    // Preferences
    preferences: {
      type: {
        // Privacy settings
        profileVisibility: { type: String, enum: ['public', 'private', 'followers'], default: 'public' },
        showEmail: { type: Boolean, default: false },
        showFollowers: { type: Boolean, default: true },
        allowComments: { type: Boolean, default: true },

        // Notification preferences
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        commentNotifications: { type: Boolean, default: true },
        likeNotifications: { type: Boolean, default: true },
        followNotifications: { type: Boolean, default: true },
        collaborationNotifications: { type: Boolean, default: true },

        // Writing preferences
        defaultPostStatus: { type: String, enum: ['draft', 'pending', 'published'], default: 'draft' },
        autoSave: { type: Boolean, default: true },
        editorTheme: { type: String, enum: ['light', 'dark'], default: 'light' },
        showWordCount: { type: Boolean, default: true },

        // Display preferences
        language: { type: String, enum: ['en', 'es', 'fr', 'de', 'am', 'om', 'ti'], default: 'en' },
        theme: { type: String, enum: ['light', 'dark', 'system', 'auto'], default: 'system' },
        timezone: { type: String, default: 'UTC' }
      },
      default: () => ({
        profileVisibility: 'public',
        showEmail: false,
        showFollowers: true,
        allowComments: true,
        emailNotifications: true,
        pushNotifications: true,
        commentNotifications: true,
        likeNotifications: true,
        followNotifications: true,
        collaborationNotifications: true,
        defaultPostStatus: 'draft',
        autoSave: true,
        editorTheme: 'light',
        showWordCount: true,
        language: 'en',
        theme: 'system',
        timezone: 'UTC'
      })
    },

    // Security fields (old schema)
    lastLogin: Date,
    passwordChangedAt: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    role: {
      type: String,
      enum: ['admin', 'moderator', 'author', 'reader'],
      default: 'reader'
    },

    isActive: {
      type: Boolean,
      default: true
    },

    // Terms and conditions acceptances
    termsAcceptances: [{
      type: {
        type: String,
        enum: ['tos', 'privacy', 'content-guidelines'],
        required: true
      },
      version: {
        type: String,
        required: true
      },
      acceptedAt: {
        type: Date,
        default: Date.now
      },
      ipAddress: {
        type: String
      }
    }]
  },
  {
    timestamps: true,  // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== VIRTUALS ====================

/**
 * Display Name Virtual
 * Priority: username > firstName lastName > email
 */
userSchema.virtual('displayName').get(function () {
  if (this.username) {
    return this.username;
  }
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  if (this.firstName) {
    return this.firstName;
  }
  return this.email.split('@')[0];
});

/**
 * Full Name Virtual
 */
userSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || '';
});

// ==================== INDEXES ====================
// Note: unique fields (email, username, universityId) already have indexes
// Only add indexes for non-unique fields used in queries
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ verificationStatus: 1 });
userSchema.index({ roleApplication: 1 });

// ==================== MIDDLEWARE ====================

/**
 * Pre-save Hook: Hash Password
 * Automatically hash password before saving if it's modified
 * Supports both 'password' (old schema) and 'passwordHash' (new schema)
 */
userSchema.pre('save', async function (next) {
  try {
    // Hash passwordHash if modified (new schema)
    if (this.isModified('passwordHash') && this.passwordHash) {
      const salt = await bcrypt.genSalt(12);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }

    // Hash password if modified (old schema)
    if (this.isModified('password') && this.password) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ==================== INSTANCE METHODS ====================

/**
 * Compare candidate password with user's hashed password
 * @param {string} candidatePassword - Plain text password to check
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.correctPassword = async function (candidatePassword) {
  // Support both old (password) and new (passwordHash) field names
  const hashedPassword = this.passwordHash || this.password;
  if (!hashedPassword) {
    throw new Error('No password hash found');
  }
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

/**
 * Check if user has a specific role
 * @param {string} roleToCheck - Role to check
 * @returns {boolean} True if user has the role
 */
userSchema.methods.hasRole = function (roleToCheck) {
  return this.role === roleToCheck;
};

// ==================== STATIC METHODS ====================

/**
 * Find user by email (case-insensitive)
 * @param {string} email - Email address to search
 * @returns {Promise<User|null>} User document or null
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find all active users
 * @returns {Promise<User[]>} Array of active user documents
 */
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

/**
 * Create default admin user if none exists
 */
userSchema.statics.createDefaultAdmin = async function () {
  try {
    const adminExists = await this.findOne({ role: 'admin' });
    if (adminExists) return null;

    const defaultAdmin = await this.create({
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@admas.edu',
      passwordHash: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456',
      firstName: 'System',
      lastName: 'Admin',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      status: 'active'
    });

    return defaultAdmin;
  } catch (error) {
    if (error.code === 11000) return null;
    throw error;
  }
};

// ==================== QUERY HELPERS ====================

/**
 * Query helper to find active users
 * Usage: User.find().active()
 */
userSchema.query.active = function () {
  return this.where({ isActive: true });
};

// Create and export model
const User = mongoose.model('User', userSchema);

export default User;
