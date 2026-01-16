import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique follow relationships
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for efficient queries
followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });

/**
 * Check if a user is following another user
 */
followSchema.statics.isFollowing = async function(followerId, followingId) {
  const follow = await this.findOne({ follower: followerId, following: followingId });
  return !!follow;
};

/**
 * Get all followers of a user
 */
followSchema.statics.getFollowers = async function(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  
  const followers = await this.find({ following: userId })
    .populate('follower', 'firstName lastName email profile')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  const total = await this.countDocuments({ following: userId });
  
  return {
    followers: followers.map(f => f.follower),
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

/**
 * Get all users a user is following
 */
followSchema.statics.getFollowing = async function(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  
  const following = await this.find({ follower: userId })
    .populate('following', 'firstName lastName email profile')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  const total = await this.countDocuments({ follower: userId });
  
  return {
    following: following.map(f => f.following),
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

/**
 * Get follower IDs for a user (for notifications)
 */
followSchema.statics.getFollowerIds = async function(userId) {
  const followers = await this.find({ following: userId }).select('follower');
  return followers.map(f => f.follower);
};

/**
 * Get follower and following counts for a user
 */
followSchema.statics.getCounts = async function(userId) {
  const [followersCount, followingCount] = await Promise.all([
    this.countDocuments({ following: userId }),
    this.countDocuments({ follower: userId })
  ]);
  
  return { followersCount, followingCount };
};

const Follow = mongoose.model('Follow', followSchema);

export default Follow;
