/**
 * Blog Page Utility Functions
 * 
 * Provides helper functions for the Advanced Blog Page feature including:
 * - Reading time calculation
 * - Number formatting with abbreviations
 * - Status badge configuration
 */

/**
 * Calculate estimated reading time from content
 * Based on average reading speed of 200 words per minute
 * 
 * @param {string} content - The text content to calculate reading time for
 * @returns {number} - Estimated reading time in minutes (minimum 1)
 */
export const calculateReadingTime = (content) => {
  if (!content || typeof content !== 'string') {
    return 1;
  }
  
  // Split by whitespace and filter out empty strings
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Calculate reading time: ceiling of (word count / 200) with minimum 1
  const readingTime = Math.ceil(wordCount / 200);
  
  return Math.max(1, readingTime);
};

/**
 * Format large numbers with K/M abbreviations
 * 
 * @param {number} num - The number to format
 * @returns {string} - Formatted string (e.g., "1.2K", "5M", "999")
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1000000) {
    // Millions
    const formatted = (absNum / 1000000).toFixed(1);
    // Remove trailing .0
    const cleaned = formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
    return `${sign}${cleaned}M`;
  }
  
  if (absNum >= 1000) {
    // Thousands
    const formatted = (absNum / 1000).toFixed(1);
    // Remove trailing .0
    const cleaned = formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
    return `${sign}${cleaned}K`;
  }
  
  return `${sign}${absNum}`;
};

/**
 * Status badge configuration mapping
 * Returns label and color class for each post status
 */
const STATUS_BADGE_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'gray',
    bgClass: 'bg-gray-100 dark:bg-gray-700',
    textClass: 'text-gray-700 dark:text-gray-300',
    borderClass: 'border-gray-300 dark:border-gray-600'
  },
  pending: {
    label: 'Pending Review',
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-700 dark:text-yellow-400',
    borderClass: 'border-yellow-300 dark:border-yellow-600'
  },
  published: {
    label: 'Published',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-400',
    borderClass: 'border-green-300 dark:border-green-600'
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-300 dark:border-red-600'
  }
};

/**
 * Get status badge configuration for a given post status
 * 
 * @param {string} status - The post status ('draft', 'pending', 'published', 'rejected')
 * @returns {object} - Badge configuration with label, color, and CSS classes
 */
export const getStatusBadgeConfig = (status) => {
  const normalizedStatus = status?.toLowerCase?.() || '';
  
  return STATUS_BADGE_CONFIG[normalizedStatus] || STATUS_BADGE_CONFIG.draft;
};

/**
 * Get all valid status options
 * @returns {string[]} - Array of valid status strings
 */
export const getValidStatuses = () => {
  return Object.keys(STATUS_BADGE_CONFIG);
};

export default {
  calculateReadingTime,
  formatNumber,
  getStatusBadgeConfig,
  getValidStatuses
};
