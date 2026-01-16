/**
 * BlogPost Virtual Properties
 * Computed properties that are not stored in the database
 */

export const addVirtuals = (schema) => {
  /**
   * Virtual for comments
   * Populates comments from Comment model
   */
  schema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
  });

  /**
   * Virtual for reading time (in minutes)
   * Calculates based on average reading speed of 200 words per minute
   */
  schema.virtual('readingTime').get(function() {
    if (!this.content) return 0;
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  });

  /**
   * Virtual for word count
   */
  schema.virtual('wordCount').get(function() {
    if (!this.content) return 0;
    return this.content.split(/\s+/).length;
  });

  /**
   * Virtual for engagement score
   * Combines likes, views, and comments into a single metric
   */
  schema.virtual('engagementScore').get(function() {
    const likeWeight = 3;
    const commentWeight = 5;
    const viewWeight = 1;
    
    return (
      (this.likesCount * likeWeight) +
      (this.commentsCount * commentWeight) +
      (this.views * viewWeight)
    );
  });

  /**
   * Virtual for formatted published date
   */
  schema.virtual('publishedDateFormatted').get(function() {
    if (!this.publishedAt) return null;
    return this.publishedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  /**
   * Virtual for time since publication
   */
  schema.virtual('timeSincePublished').get(function() {
    if (!this.publishedAt) return null;
    
    const now = new Date();
    const diff = now - this.publishedAt;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  });

  /**
   * Virtual for preview text (first 150 characters)
   */
  schema.virtual('preview').get(function() {
    if (!this.content) return '';
    const plainText = this.content.replace(/<[^>]*>/g, ''); // Strip HTML tags
    return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  });
};
