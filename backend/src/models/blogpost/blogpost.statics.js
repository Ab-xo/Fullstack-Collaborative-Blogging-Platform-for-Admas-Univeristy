/**
 * BlogPost Static Methods
 * Methods available on the BlogPost model itself
 */

export const addStaticMethods = (schema) => {
  /**
   * Find all published posts
   * @returns {Promise<BlogPost[]>} Array of published blog posts
   */
  schema.statics.findPublished = function() {
    return this.find({ status: 'published' });
  };

  /**
   * Find posts by author
   * @param {ObjectId} authorId - Author user ID
   * @returns {Promise<BlogPost[]>} Array of blog posts by author
   */
  schema.statics.findByAuthor = function(authorId) {
    return this.find({ author: authorId });
  };

  /**
   * Find published posts by category
   * @param {string} category - Category name
   * @returns {Promise<BlogPost[]>} Array of blog posts in category
   */
  schema.statics.findByCategory = function(category) {
    return this.find({ category, status: 'published' });
  };

  /**
   * Find popular posts (by likes and views)
   * @param {number} limit - Maximum number of posts to return
   * @returns {Promise<BlogPost[]>} Array of popular blog posts
   */
  schema.statics.findPopular = function(limit = 10) {
    return this.find({ status: 'published' })
      .sort({ likesCount: -1, views: -1 })
      .limit(limit);
  };

  /**
   * Find posts by tag
   * @param {string} tag - Tag name
   * @returns {Promise<BlogPost[]>} Array of blog posts with tag
   */
  schema.statics.findByTag = function(tag) {
    return this.find({ tags: tag, status: 'published' });
  };

  /**
   * Find pending posts (for moderation)
   * @returns {Promise<BlogPost[]>} Array of pending blog posts
   */
  schema.statics.findPending = function() {
    return this.find({ status: 'pending' })
      .populate('author', 'firstName lastName email profile')
      .sort({ createdAt: -1 });
  };

  /**
   * Find recent posts
   * @param {number} limit - Maximum number of posts to return
   * @returns {Promise<BlogPost[]>} Array of recent blog posts
   */
  schema.statics.findRecent = function(limit = 10) {
    return this.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(limit);
  };

  /**
   * Search posts by query
   * @param {string} query - Search query
   * @param {Object} options - Search options (limit, page)
   * @returns {Promise<Object>} Search results with posts and metadata
   */
  schema.statics.search = async function(query, options = {}) {
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;

    const searchQuery = {
      status: 'published',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    };

    const posts = await this.find(searchQuery)
      .populate('author', 'firstName lastName email profile')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await this.countDocuments(searchQuery);

    return {
      posts,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  };

  /**
   * Get post statistics
   * @returns {Promise<Object>} Statistics object
   */
  schema.statics.getStatistics = async function() {
    const total = await this.countDocuments();
    const published = await this.countDocuments({ status: 'published' });
    const draft = await this.countDocuments({ status: 'draft' });
    const pending = await this.countDocuments({ status: 'pending' });
    const rejected = await this.countDocuments({ status: 'rejected' });
    const archived = await this.countDocuments({ status: 'archived' });

    return {
      total,
      published,
      draft,
      pending,
      rejected,
      archived
    };
  };

  /**
   * Get trending posts (most viewed in last 7 days)
   * @param {number} limit - Maximum number of posts to return
   * @returns {Promise<BlogPost[]>} Array of trending blog posts
   */
  schema.statics.findTrending = function(limit = 10) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.find({
      status: 'published',
      publishedAt: { $gte: sevenDaysAgo }
    })
      .sort({ views: -1, likesCount: -1 })
      .limit(limit);
  };
};
