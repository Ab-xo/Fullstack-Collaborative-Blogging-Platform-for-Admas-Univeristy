/**
 * BlogPost Instance Methods
 * Methods available on individual blog post documents
 */

export const addInstanceMethods = (schema) => {
  // ==================== ENGAGEMENT METHODS ====================

  /**
   * Increment view count
   * @returns {Promise<BlogPost>} Updated blog post document
   */
  schema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
  };

  /**
   * Add a like from a user (removes dislike if exists)
   * @param {ObjectId} userId - User ID to add like
   * @returns {Promise<BlogPost>} Updated blog post document
   */
  schema.methods.addLike = function(userId) {
    // Remove dislike if user had disliked
    const dislikeIndex = this.dislikes.indexOf(userId);
    if (dislikeIndex > -1) {
      this.dislikes.splice(dislikeIndex, 1);
      this.dislikesCount = this.dislikes.length;
    }
    
    // Add like if not already liked
    if (!this.likes.includes(userId)) {
      this.likes.push(userId);
      this.likesCount = this.likes.length;
      return this.save();
    }
    return Promise.resolve(this);
  };

  /**
   * Remove a like from a user
   * @param {ObjectId} userId - User ID to remove like
   * @returns {Promise<BlogPost>} Updated blog post document
   */
  schema.methods.removeLike = function(userId) {
    const index = this.likes.indexOf(userId);
    if (index > -1) {
      this.likes.splice(index, 1);
      this.likesCount = this.likes.length;
      return this.save();
    }
    return Promise.resolve(this);
  };

  /**
   * Check if a user has liked this post
   * @param {ObjectId} userId - User ID to check
   * @returns {boolean} True if user has liked the post
   */
  schema.methods.isLikedBy = function(userId) {
    return this.likes.includes(userId);
  };

  /**
   * Add a dislike from a user (removes like if exists)
   * @param {ObjectId} userId - User ID to add dislike
   * @returns {Promise<BlogPost>} Updated blog post document
   */
  schema.methods.addDislike = function(userId) {
    // Remove like if user had liked
    const likeIndex = this.likes.indexOf(userId);
    if (likeIndex > -1) {
      this.likes.splice(likeIndex, 1);
      this.likesCount = this.likes.length;
    }
    
    // Add dislike if not already disliked
    if (!this.dislikes.includes(userId)) {
      this.dislikes.push(userId);
      this.dislikesCount = this.dislikes.length;
      return this.save();
    }
    return Promise.resolve(this);
  };

  /**
   * Remove a dislike from a user
   * @param {ObjectId} userId - User ID to remove dislike
   * @returns {Promise<BlogPost>} Updated blog post document
   */
  schema.methods.removeDislike = function(userId) {
    const index = this.dislikes.indexOf(userId);
    if (index > -1) {
      this.dislikes.splice(index, 1);
      this.dislikesCount = this.dislikes.length;
      return this.save();
    }
    return Promise.resolve(this);
  };

  /**
   * Check if a user has disliked this post
   * @param {ObjectId} userId - User ID to check
   * @returns {boolean} True if user has disliked the post
   */
  schema.methods.isDislikedBy = function(userId) {
    return this.dislikes.includes(userId);
  };

  // ==================== AUTHORIZATION METHODS ====================

  /**
   * Check if a user can edit this post
   * @param {ObjectId} userId - User ID to check
   * @returns {boolean} True if user is the author
   */
  schema.methods.canEdit = function(userId) {
    return this.author.toString() === userId.toString();
  };

  // ==================== STATUS METHODS ====================

  /**
   * Publish the post
   * @returns {Promise<BlogPost>} Updated blog post document
   */
  schema.methods.publish = function() {
    this.status = 'published';
    this.publishedAt = new Date();
    return this.save();
  };

  /**
   * Submit post for review
   * @returns {Promise<BlogPost>} Updated blog post document
   */
  schema.methods.submitForReview = function() {
    this.status = 'pending';
    return this.save();
  };

  /**
   * Archive the post
   * @returns {Promise<BlogPost>} Updated blog post document
   */
  schema.methods.archive = function() {
    this.status = 'archived';
    return this.save();
  };

  /**
   * Approve the post (for moderators)
   * @param {ObjectId} moderatorId - Moderator user ID
   * @param {string} notes - Optional moderation notes
   * @returns {Promise<BlogPost>} Updated blog post document
   */
  schema.methods.approve = function(moderatorId, notes = '') {
    this.status = 'published';
    this.publishedAt = new Date();
    this.moderatedBy = moderatorId;
    this.moderatedAt = new Date();
    if (notes) {
      this.moderationNotes = notes;
    }
    return this.save();
  };

  /**
   * Reject the post (for moderators)
   * @param {ObjectId} moderatorId - Moderator user ID
   * @param {string} notes - Rejection reason
   * @returns {Promise<BlogPost>} Updated blog post document
   */
  schema.methods.reject = function(moderatorId, notes) {
    this.status = 'rejected';
    this.moderatedBy = moderatorId;
    this.moderatedAt = new Date();
    this.moderationNotes = notes;
    return this.save();
  };

  // ==================== VALIDATION METHODS ====================

  /**
   * Check if post is published
   * @returns {boolean} True if post is published
   */
  schema.methods.isPublished = function() {
    return this.status === 'published';
  };

  /**
   * Check if post is draft
   * @returns {boolean} True if post is draft
   */
  schema.methods.isDraft = function() {
    return this.status === 'draft';
  };

  /**
   * Check if post is pending review
   * @returns {boolean} True if post is pending
   */
  schema.methods.isPending = function() {
    return this.status === 'pending';
  };

  /**
   * Check if post is rejected
   * @returns {boolean} True if post is rejected
   */
  schema.methods.isRejected = function() {
    return this.status === 'rejected';
  };

  /**
   * Check if post is archived
   * @returns {boolean} True if post is archived
   */
  schema.methods.isArchived = function() {
    return this.status === 'archived';
  };
};
