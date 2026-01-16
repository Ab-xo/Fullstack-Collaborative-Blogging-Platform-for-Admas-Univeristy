import mongoose from 'mongoose';

/**
 * BlogPost Schema Fields Definition
 * Organized by logical groups for better readability
 */

export const blogPostSchemaFields = {
  // ==================== BASIC INFORMATION ====================
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    minlength: [5, 'Title must be at least 5 characters long']
  },

  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content must be at least 50 characters long']
  },

  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },

  // ==================== AUTHOR INFORMATION ====================
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ==================== COLLABORATION ====================
  /**
   * Co-authors who can edit this post
   * The main author can invite other users to collaborate
   */
  coAuthors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['editor', 'contributor', 'reviewer'],
      default: 'contributor'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  /**
   * Pending collaboration invitations
   */
  collaborationInvites: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['editor', 'contributor', 'reviewer'],
      default: 'contributor'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],

  /**
   * Revision history for tracking changes
   */
  revisions: [{
    content: String,
    title: String,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    changeNote: String
  }],

  // ==================== CATEGORIZATION ====================
  /**
   * Blog Post Categories - University-focused topics
   * Categories covering all aspects of university life and academics
   */
  category: {
    type: String,
    required: true,
    enum: [
      // ===== BUSINESS & FINANCE (Core Program) =====
      'accounting',              // Accounting topics, financial reporting
      'finance',                 // Finance, investments, banking
      'business-management',     // Business administration, management
      'marketing',               // Marketing strategies, digital marketing
      'economics',               // Economic theories, market analysis

      // ===== TECHNOLOGY (Core Program) =====
      'computer-science',        // CS fundamentals, algorithms, data structures
      'programming',             // Coding, software development
      'software-engineering',    // Software design, development practices
      'technology',              // Tech trends, digital tools
      'innovation',              // Startups, entrepreneurship, new ideas

      // ===== AGRICULTURE & EDUCATION (Core Programs) =====
      'agricultural-economics',  // Agricultural economics, agribusiness
      'educational-planning',    // Educational planning and policy
      'education-management',    // Education administration, leadership
      'research',                // Research papers, findings, publications
      'academic',                // General academic content, study tips

      // ===== CAMPUS LIFE =====
      'campus-life',             // Daily life, student experiences
      'events',                  // University events, seminars, workshops
      'student-clubs',           // Student clubs and organizations
      'sports',                  // Athletics, sports events, fitness
      'alumni',                  // Alumni stories, success stories

      // ===== CAREER & MORE =====
      'career',                  // Job tips, career advice
      'internships',             // Internship opportunities, experiences
      'opinion',                 // Opinion pieces, editorials
      'news',                    // Latest news, announcements
      'culture',                 // Cultural events, traditions, diversity

      // ===== PROGRAMS =====
      'programs'                 // Academic programs and degrees
    ],
    default: 'academic'
  },

  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],

  // ==================== MEDIA ====================
  featuredImage: {
    type: String,
    default: ''
  },

  // ==================== STATUS AND WORKFLOW ====================
  status: {
    type: String,
    enum: ['draft', 'pending', 'under_review', 'approved', 'published', 'rejected', 'archived'],
    default: 'draft'
  },

  // ==================== MODERATION ====================
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  moderationNotes: String,
  moderatedAt: Date,

  /**
   * Reviews from co-authors or peer reviewers
   */
  reviews: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['approved', 'changes_requested', 'comment_only'],
      default: 'comment_only'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  /**
   * AI-generated violation report
   * Feature: ai-content-assistant
   * Requirements: 3.3, 4.4
   */
  violationReport: {
    hasViolations: {
      type: Boolean,
      default: false
    },
    isClean: {
      type: Boolean,
      default: true
    },
    severity: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical'],
      default: 'none'
    },
    violations: [{
      type: {
        type: String,
        enum: ['hate_speech', 'spam', 'inappropriate_content', 'personal_attacks',
          'plagiarism', 'profanity', 'harassment', 'violence', 'misleading_information']
      },
      description: String,
      excerpt: String,
      location: String
    }],
    analyzedAt: Date,
    sources: {
      ruleBased: { type: Boolean, default: false },
      ai: { type: Boolean, default: false }
    }
  },

  // ==================== PUBLISHING ====================
  publishedAt: Date,

  // ==================== SEO AND VISIBILITY ====================
  slug: {
    type: String,
    unique: true,
    sparse: true
  },

  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },

  // ==================== ENGAGEMENT METRICS ====================
  views: {
    type: Number,
    default: 0
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  likesCount: {
    type: Number,
    default: 0
  },

  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  dislikesCount: {
    type: Number,
    default: 0
  },

  commentsCount: {
    type: Number,
    default: 0
  },

  // ==================== TIMESTAMPS ====================
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
};

/**
 * Schema Options
 */
export const schemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
};

/**
 * Schema Indexes
 * Optimized for common query patterns and analytics
 */
export const schemaIndexes = [
  // Existing indexes
  { fields: { author: 1, createdAt: -1 } },
  { fields: { status: 1, publishedAt: -1 } },
  { fields: { category: 1, publishedAt: -1 } },
  { fields: { tags: 1 } },
  { fields: { likesCount: -1 } },
  { fields: { dislikesCount: -1 } },
  { fields: { views: -1 } },
  // Note: slug already has unique: true in schema, no need for separate index

  // Analytics-optimized indexes
  { fields: { status: 1, category: 1 } }, // For category workload queries
  { fields: { author: 1, status: 1 } }, // For author dashboard queries
  { fields: { moderatedAt: -1 } }, // For moderation trends
  { fields: { moderatedBy: 1, moderatedAt: -1 } }, // For moderator performance
  { fields: { publishedAt: -1, status: 1 } }, // For engagement trends
  { fields: { category: 1, status: 1, publishedAt: -1 } }, // For category stats
  { fields: { createdAt: -1 } } // For general time-based queries
];
