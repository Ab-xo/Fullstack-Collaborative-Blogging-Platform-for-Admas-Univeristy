/**
 * BlogPost Middleware (Hooks)
 * Pre and post hooks for various operations
 */

export const addMiddleware = (schema) => {
  // ==================== PRE SAVE HOOKS ====================

  /**
   * Pre-save hook to update timestamps and generate slug/excerpt
   */
  schema.pre('save', function(next) {
    // Update updatedAt timestamp
    this.updatedAt = Date.now();
    
    // Generate excerpt from content if not provided
    if (!this.excerpt && this.content) {
      // Strip HTML tags and get first 250 characters
      const plainText = this.content.replace(/<[^>]*>/g, '');
      this.excerpt = plainText.substring(0, 250) + (plainText.length > 250 ? '...' : '');
    }
    
    // Generate slug from title if not provided
    if (!this.slug && this.title) {
      let baseSlug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // Remove special characters
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-')          // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
        .substring(0, 100);           // Limit length
      
      // If slug is empty after cleaning, use 'post' as default
      if (!baseSlug) {
        baseSlug = 'post';
      }
      
      // Add timestamp to ensure uniqueness if needed
      if (this.isNew) {
        this.slug = `${baseSlug}-${Date.now()}`;
      } else {
        this.slug = baseSlug;
      }
    }
    
    next();
  });

  /**
   * Pre-save hook to validate status transitions
   */
  schema.pre('save', function(next) {
    if (!this.isModified('status')) {
      return next();
    }

    const validTransitions = {
      'draft': ['pending', 'archived'],
      'pending': ['published', 'rejected', 'draft'],
      'published': ['archived'],
      'rejected': ['draft', 'pending'],
      'archived': ['draft']
    };

    // Skip validation for new documents
    if (this.isNew) {
      return next();
    }

    // Get original status from database
    this.constructor.findById(this._id).then(original => {
      if (!original) {
        return next();
      }

      const allowedTransitions = validTransitions[original.status] || [];
      if (!allowedTransitions.includes(this.status)) {
        const error = new Error(
          `Invalid status transition from ${original.status} to ${this.status}`
        );
        return next(error);
      }
      next();
    }).catch(next);
  });

  // ==================== POST SAVE HOOKS ====================

  /**
   * Post-save hook to log post creation
   */
  schema.post('save', function(doc) {
    if (doc.isNew) {
      console.log(`✅ New blog post created: "${doc.title}" by ${doc.author}`);
    }
  });

  // ==================== PRE REMOVE HOOKS ====================

  /**
   * Pre-remove hook to clean up related data
   */
  schema.pre('remove', async function(next) {
    try {
      // Remove all comments associated with this post
      await this.model('Comment').deleteMany({ post: this._id });
      console.log(`🗑️  Removed comments for post: ${this.title}`);
      next();
    } catch (error) {
      next(error);
    }
  });

  /**
   * Pre-deleteOne hook to clean up related data
   */
  schema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
      // Remove all comments associated with this post
      await this.model('Comment').deleteMany({ post: this._id });
      console.log(`🗑️  Removed comments for post: ${this.title}`);
      next();
    } catch (error) {
      next(error);
    }
  });

  // ==================== PRE FIND HOOKS ====================

  /**
   * Pre-find hook to populate author by default
   */
  schema.pre(/^find/, function(next) {
    // Skip population in test environment or if explicitly disabled
    if (process.env.NODE_ENV === 'test' || this.getOptions().skipPopulate) {
      return next();
    }
    
    // Only populate if not already specified
    this.populate({
      path: 'author',
      select: 'firstName lastName email profile'
    });
    next();
  });

  // ==================== POST FIND HOOKS ====================

  /**
   * Post-find hook to filter out archived posts for non-admin queries
   */
  schema.post(/^find/, function(docs, next) {
    // This can be customized based on user context
    // For now, we'll keep all results
    next();
  });
};
