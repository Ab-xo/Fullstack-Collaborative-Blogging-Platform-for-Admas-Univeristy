import mongoose from 'mongoose';

/**
 * Document Model
 * 
 * Stores metadata for uploaded verification documents (e.g., graduation certificates).
 * Actual files are stored in the file system, this model tracks the metadata.
 */

const documentSchema = new mongoose.Schema(
  {
    // Reference to the user who uploaded the document
    // Not required during registration (document uploaded before user created)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    
    // Generated unique filename for storage
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      unique: true
    },
    
    // Original filename from upload
    originalName: {
      type: String,
      required: [true, 'Original filename is required']
    },
    
    // MIME type of the file
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      enum: {
        values: ['application/pdf'],
        message: 'Only PDF files are allowed'
      }
    },
    
    // File size in bytes
    size: {
      type: Number,
      required: [true, 'File size is required'],
      max: [5 * 1024 * 1024, 'File size cannot exceed 5MB'] // 5MB limit
    },
    
    // Storage path relative to uploads directory
    path: {
      type: String,
      required: [true, 'File path is required']
    },
    
    // Document type/purpose
    documentType: {
      type: String,
      enum: ['graduation_certificate', 'transcript', 'employment_letter', 'other'],
      default: 'graduation_certificate'
    },
    
    // Upload timestamp
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient user document lookups
documentSchema.index({ userId: 1, documentType: 1 });

// Note: filename already has unique: true in schema, no need for separate index

/**
 * Find all documents for a user
 * @param {ObjectId} userId - The user's ID
 * @returns {Promise<Document[]>}
 */
documentSchema.statics.findByUserId = function(userId) {
  return this.find({ userId }).sort({ uploadedAt: -1 });
};

/**
 * Find document by filename
 * @param {string} filename - The unique filename
 * @returns {Promise<Document|null>}
 */
documentSchema.statics.findByFilename = function(filename) {
  return this.findOne({ filename });
};

const Document = mongoose.model('Document', documentSchema);

export default Document;
