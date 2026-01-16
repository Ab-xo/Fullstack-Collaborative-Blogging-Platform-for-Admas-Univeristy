/**
 * ============================================================================
 * AI API MODULE
 * ============================================================================
 * Frontend API client for AI-powered features including:
 * - Keyword suggestions
 * - Content analysis
 * - Content quality suggestions
 * - AI service status
 * 
 * Includes caching to reduce API costs and improve performance.
 * 
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import apiClient from './client';

// Simple in-memory cache for AI responses
const suggestionsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a cache key from content
 * @param {string} title - Post title
 * @param {string} content - Post content
 * @param {string} category - Post category
 * @returns {string} Cache key
 */
const generateCacheKey = (title, content, category) => {
  const normalizedContent = `${title}|${content?.substring(0, 500)}|${category}`;
  return btoa(encodeURIComponent(normalizedContent)).substring(0, 64);
};

/**
 * Check if cached data is still valid
 * @param {Object} cached - Cached data object
 * @returns {boolean} Whether cache is valid
 */
const isCacheValid = (cached) => {
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_TTL;
};

/**
 * Get keyword suggestions for a blog post
 * @param {string} title - Post title
 * @param {string} content - Post content  
 * @param {string} category - Post category
 * @returns {Promise<Object>} Keyword suggestions
 */
export const getKeywordSuggestions = async (title, content, category = 'general') => {
  try {
    // Check cache first
    const cacheKey = generateCacheKey(title, content, category);
    const cached = suggestionsCache.get(cacheKey);
    
    if (isCacheValid(cached)) {
      console.log('[AI API] Returning cached keyword suggestions');
      return { success: true, data: cached.data, fromCache: true };
    }

    const response = await apiClient.post('/ai/keywords', {
      title,
      content,
      category
    });

    // Cache the response
    if (response.data?.success) {
      suggestionsCache.set(cacheKey, {
        data: response.data.data,
        timestamp: Date.now()
      });
    }

    return response.data;
  } catch (error) {
    console.error('[AI API] Keyword suggestions error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get keyword suggestions',
      error: error.message
    };
  }
};

/**
 * Analyze content for quality and appropriateness
 * @param {string} content - Content to analyze
 * @param {string} title - Post title
 * @returns {Promise<Object>} Content analysis results
 */
export const analyzeContent = async (content, title = '') => {
  try {
    const response = await apiClient.post('/ai/analyze', {
      content,
      title
    });

    return response.data;
  } catch (error) {
    console.error('[AI API] Content analysis error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to analyze content',
      error: error.message
    };
  }
};

/**
 * Get content improvement suggestions
 * @param {string} content - Content to get suggestions for
 * @returns {Promise<Object>} Content suggestions
 */
export const getContentSuggestions = async (content) => {
  try {
    const response = await apiClient.post('/ai/analyze', {
      content,
      title: ''
    });

    // Extract just the suggestions part
    if (response.data?.success && response.data?.data?.suggestions) {
      return {
        success: true,
        data: response.data.data.suggestions
      };
    }

    return response.data;
  } catch (error) {
    console.error('[AI API] Content suggestions error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get content suggestions',
      error: error.message
    };
  }
};

/**
 * Check AI service status
 * @returns {Promise<Object>} AI service status
 */
export const checkAIStatus = async () => {
  try {
    const response = await apiClient.get('/ai/status');
    return response.data;
  } catch (error) {
    console.error('[AI API] Status check error:', error);
    return {
      success: false,
      data: {
        openai: { configured: false },
        features: {
          keywordSuggestions: false,
          contentAnalysis: false,
          spamDetection: false,
          excerptGeneration: false,
          contentModeration: true
        }
      }
    };
  }
};

/**
 * Generate an excerpt for content
 * @param {string} content - Content to summarize
 * @param {number} maxLength - Maximum excerpt length
 * @returns {Promise<Object>} Generated excerpt
 */
export const generateExcerpt = async (content, maxLength = 200) => {
  try {
    const response = await apiClient.post('/ai/excerpt', {
      content,
      maxLength
    });
    return response.data;
  } catch (error) {
    console.error('[AI API] Excerpt generation error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to generate excerpt',
      error: error.message
    };
  }
};

/**
 * Check content for spam
 * @param {string} content - Content to check
 * @returns {Promise<Object>} Spam check results
 */
export const checkSpam = async (content) => {
  try {
    const response = await apiClient.post('/ai/spam-check', { content });
    return response.data;
  } catch (error) {
    console.error('[AI API] Spam check error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to check for spam',
      error: error.message
    };
  }
};

/**
 * Generate content paragraphs based on title and category
 * Feature: ai-content-assistant
 * Requirements: 1.1, 1.2
 * 
 * @param {string} title - Post title (minimum 5 characters)
 * @param {string} category - Post category
 * @returns {Promise<Object>} Generated paragraph suggestions
 */
export const generateContent = async (title, category = 'general') => {
  try {
    const response = await apiClient.post('/ai/generate-content', {
      title,
      category
    });
    return response.data;
  } catch (error) {
    console.error('[AI API] Content generation error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to generate content',
      error: error.message
    };
  }
};

/**
 * Check content for rule violations
 * Feature: ai-content-assistant
 * Requirements: 3.1
 * 
 * @param {string} title - Post title
 * @param {string} content - Post content
 * @param {boolean} notifyModerators - Whether to notify moderators of high/critical violations
 * @returns {Promise<Object>} Violation report
 */
export const checkViolations = async (title, content, notifyModerators = false) => {
  try {
    const response = await apiClient.post('/ai/check-violations', {
      title,
      content,
      notifyModerators
    });
    return response.data;
  } catch (error) {
    console.error('[AI API] Violation check error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to check for violations',
      error: error.message
    };
  }
};

/**
 * Clear the suggestions cache
 */
export const clearCache = () => {
  suggestionsCache.clear();
  console.log('[AI API] Cache cleared');
};

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
export const getCacheStats = () => {
  return {
    size: suggestionsCache.size,
    ttl: CACHE_TTL
  };
};

// Export all functions as aiAPI object for convenience
export const aiAPI = {
  getKeywordSuggestions,
  analyzeContent,
  getContentSuggestions,
  checkAIStatus,
  generateExcerpt,
  checkSpam,
  generateContent,
  checkViolations,
  clearCache,
  getCacheStats
};

export default aiAPI;
