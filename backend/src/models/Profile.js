import mongoose from 'mongoose';

/**
 * Profile Model
 * Extended user information separate from authentication
 * 1:1 relationship with User model
 */

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    
    // ==================== PERSONAL INFORMATION ====================
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    
    avatar: {
      type: String,
      default: ''
    },
    
    // ==================== CONTACT INFORMATION ====================
    contactInfo: {
      phone: String,
      website: String
    },
    
    // ==================== SOCIAL MEDIA ====================
    socialMedia: {
      twitter: String,
      linkedin: String,
      github: String
    },
    
    // ==================== UNIVERSITY INFORMATION ====================
    universityInfo: {
      roleApplication: {
        type: String,
        enum: ['student', 'faculty', 'alumni', 'staff']
      },
      universityId: {
        type: String,
        trim: true
      },
      department: {
        type: String,
        trim: true
      },
      yearOfStudy: {
        type: String,
        trim: true
      },
      position: {
        type: String,
        trim: true
      },
      graduationYear: {
        type: String,
        trim: true
      },
      verificationDocument: String,
      verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: Date,
      verificationNotes: String
    },
    
    // ==================== USER PREFERENCES ====================
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      pushNotifications: {
        type: Boolean,
        default: true
      },
      language: {
        type: String,
        enum: ['en', 'am', 'om', 'ti'],
        default: 'en'
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
      }
    },
    
    // ==================== EMAIL VERIFICATION ====================
    emailVerification: {
      isVerified: {
        type: Boolean,
        default: false
      },
      token: String,
      tokenExpires: Date
    },
    
    // ==================== FIREBASE INTEGRATION ====================
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================
profileSchema.index({ userId: 1 }, { unique: true });
profileSchema.index({ 'universityInfo.universityId': 1 });
profileSchema.index({ 'universityInfo.verificationStatus': 1 });
profileSchema.index({ firebaseUid: 1 }, { sparse: true });

// ==================== VIRTUALS ====================

/**
 * Full Name Virtual
 */
profileSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || '';
});

// ==================== INSTANCE METHODS ====================

/**
 * Create email verification token
 * @returns {string} 6-digit verification token
 */
profileSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerification.token = verificationToken;
  this.emailVerification.tokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verificationToken;
};

/**
 * Validate university credentials based on role
 * @returns {Object} Validation result
 */
profileSchema.methods.validateUniversityCredentials = function () {
  const { roleApplication, universityId, department, yearOfStudy, position, graduationYear } = this.universityInfo;
  
  if (!universityId) {
    return { valid: false, reason: 'University ID is required' };
  }
  
  if (roleApplication === 'student' && !yearOfStudy) {
    return { valid: false, reason: 'Year of study is required for students' };
  }
  
  if (roleApplication === 'faculty' && !position) {
    return { valid: false, reason: 'Position is required for faculty' };
  }
  
  if (roleApplication === 'alumni' && !graduationYear) {
    return { valid: false, reason: 'Graduation year is required for alumni' };
  }
  
  if (['student', 'faculty'].includes(roleApplication) && !department) {
    return { valid: false, reason: 'Department is required' };
  }
  
  return { valid: true };
};

// ==================== STATIC METHODS ====================

/**
 * Find profile by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Profile|null>} Profile document or null
 */
profileSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId }).populate('userId', 'username email role isActive');
};

/**
 * Find pending verification profiles
 * @returns {Promise<Profile[]>} Array of profiles pending verification
 */
profileSchema.statics.findPendingVerification = function () {
  return this.find({ 'universityInfo.verificationStatus': 'pending' })
    .populate('userId', 'username email');
};

// Create and export model
const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
