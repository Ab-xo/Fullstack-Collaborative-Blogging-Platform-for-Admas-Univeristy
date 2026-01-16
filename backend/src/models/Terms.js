/**
 * Terms Model - Manages Terms of Service, Privacy Policy, and Content Guidelines
 * Supports versioning and tracking of user acceptances
 */
import mongoose from 'mongoose';

const termsSchema = new mongoose.Schema({
  // Type of terms document
  type: {
    type: String,
    required: true,
    enum: ['tos', 'privacy', 'content-guidelines'],
    index: true
  },
  
  // Semantic version (e.g., '1.0.0')
  version: {
    type: String,
    required: true,
    match: /^\d+\.\d+\.\d+$/
  },
  
  // Document title
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Full content in markdown format
  content: {
    type: String,
    required: true
  },
  
  // Brief summary for display
  summary: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // When these terms become effective
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Admin who created this version
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Whether this is the current active version
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient lookups
termsSchema.index({ type: 1, version: 1 }, { unique: true });
termsSchema.index({ type: 1, isActive: 1 });

// Static method to get current active terms by type
termsSchema.statics.getCurrentByType = async function(type) {
  return this.findOne({ type, isActive: true }).sort({ effectiveDate: -1 });
};

// Static method to get all versions of a terms type
termsSchema.statics.getAllVersions = async function(type) {
  return this.find({ type }).sort({ effectiveDate: -1 });
};

// Static method to deactivate old versions when new one is created
termsSchema.statics.deactivateOldVersions = async function(type, exceptVersion) {
  return this.updateMany(
    { type, version: { $ne: exceptVersion } },
    { isActive: false }
  );
};

const Terms = mongoose.model('Terms', termsSchema);

export default Terms;
