import mongoose from 'mongoose';

/**
 * Newsletter Subscriber Model
 * Stores email subscriptions for newsletter updates
 */

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    subscribedAt: {
      type: Date,
      default: Date.now
    },
    
    unsubscribedAt: {
      type: Date,
      default: null
    },
    
    // Track subscription source
    source: {
      type: String,
      enum: ['homepage', 'footer', 'popup', 'blog', 'other'],
      default: 'homepage'
    },
    
    // Preferences for what content to receive
    preferences: {
      newPosts: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      events: { type: Boolean, default: true }
    },
    
    // Unsubscribe token for secure unsubscription
    unsubscribeToken: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isActive: 1 });
newsletterSchema.index({ subscribedAt: -1 });

// Static method to find active subscribers
newsletterSchema.statics.findActiveSubscribers = function () {
  return this.find({ isActive: true });
};

// Instance method to unsubscribe
newsletterSchema.methods.unsubscribe = function () {
  this.isActive = false;
  this.unsubscribedAt = new Date();
  return this.save();
};

// Instance method to resubscribe
newsletterSchema.methods.resubscribe = function () {
  this.isActive = true;
  this.unsubscribedAt = null;
  return this.save();
};

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;
