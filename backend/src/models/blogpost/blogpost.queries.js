/**
 * BlogPost Query Helpers
 * Custom query methods for chainable queries
 */

export const addQueryHelpers = (schema) => {
  /**
   * Filter by published status
   */
  schema.query.published = function() {
    return this.where({ status: 'published' });
  };

  /**
   * Filter by draft status
   */
  schema.query.drafts = function() {
    return this.where({ status: 'draft' });
  };

  /**
   * Filter by pending status
   */
  schema.query.pending = function() {
    return this.where({ status: 'pending' });
  };

  /**
   * Filter by category
   * @param {string} category - Category name
   */
  schema.query.byCategory = function(category) {
    return this.where({ category });
  };

  /**
   * Filter by tag
   * @param {string} tag - Tag name
   */
  schema.query.byTag = function(tag) {
    return this.where({ tags: tag });
  };

  /**
   * Filter by author
   * @param {ObjectId} authorId - Author user ID
   */
  schema.query.byAuthor = function(authorId) {
    return this.where({ author: authorId });
  };

  /**
   * Sort by popularity (likes and views)
   */
  schema.query.popular = function() {
    return this.sort({ likesCount: -1, views: -1 });
  };

  /**
   * Sort by most recent
   */
  schema.query.recent = function() {
    return this.sort({ publishedAt: -1, createdAt: -1 });
  };

  /**
   * Sort by most viewed
   */
  schema.query.mostViewed = function() {
    return this.sort({ views: -1 });
  };

  /**
   * Sort by most liked
   */
  schema.query.mostLiked = function() {
    return this.sort({ likesCount: -1 });
  };

  /**
   * Filter posts published within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  schema.query.publishedBetween = function(startDate, endDate) {
    return this.where({
      publishedAt: {
        $gte: startDate,
        $lte: endDate
      }
    });
  };

  /**
   * Filter posts with minimum views
   * @param {number} minViews - Minimum view count
   */
  schema.query.minViews = function(minViews) {
    return this.where({ views: { $gte: minViews } });
  };

  /**
   * Filter posts with minimum likes
   * @param {number} minLikes - Minimum like count
   */
  schema.query.minLikes = function(minLikes) {
    return this.where({ likesCount: { $gte: minLikes } });
  };

  /**
   * Search by text in title or content
   * @param {string} searchText - Text to search for
   */
  schema.query.search = function(searchText) {
    return this.where({
      $or: [
        { title: { $regex: searchText, $options: 'i' } },
        { content: { $regex: searchText, $options: 'i' } },
        { tags: { $regex: searchText, $options: 'i' } }
      ]
    });
  };

  /**
   * Exclude archived posts
   */
  schema.query.notArchived = function() {
    return this.where({ status: { $ne: 'archived' } });
  };

  /**
   * Include only posts with featured images
   */
  schema.query.withFeaturedImage = function() {
    return this.where({ featuredImage: { $ne: '', $exists: true } });
  };

  /**
   * Paginate results
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page
   */
  schema.query.paginate = function(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return this.skip(skip).limit(limit);
  };
};
