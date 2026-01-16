/**
 * ============================================================================
 * OPENAI SERVICE
 * ============================================================================
 * AI-powered content moderation, keyword suggestions, and harmful content detection
 */

import OpenAI from 'openai';

// Initialize OpenAI client only if API key is available
let openai = null;

// Check if OpenAI is configured
const isConfigured = () => {
  return !!process.env.OPENAI_API_KEY;
};

// Lazy initialization of OpenAI client
const getClient = () => {
  if (!openai && isConfigured()) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

/**
 * Analyze content for harmful/inappropriate material
 * @param {string} content - The content to analyze
 * @returns {Object} Analysis result with flags and recommendations
 */
export const analyzeContent = async (content) => {
  if (!isConfigured()) {
    console.log('⚠️ OpenAI not configured, skipping content analysis');
    return {
      success: true,
      isAppropriate: true,
      flags: [],
      confidence: 0,
      message: 'OpenAI not configured - content not analyzed'
    };
  }

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a content moderation assistant for a university blogging platform. 
          Analyze the following content and determine if it contains:
          1. Hate speech or discrimination
          2. Violence or threats
          3. Sexual content or nudity
          4. Harassment or bullying
          5. Spam or misleading information
          6. Profanity or vulgar language
          7. Personal attacks
          8. Plagiarism indicators
          
          Respond in JSON format with:
          {
            "isAppropriate": boolean,
            "confidence": number (0-100),
            "flags": [array of detected issues],
            "severity": "none" | "low" | "medium" | "high" | "critical",
            "recommendation": "approve" | "review" | "reject",
            "details": "brief explanation"
          }`
        },
        {
          role: 'user',
          content: content.substring(0, 4000) // Limit content length
        }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('OpenAI content analysis error:', error.message);
    return {
      success: false,
      isAppropriate: true, // Default to appropriate if analysis fails
      flags: [],
      confidence: 0,
      message: 'Content analysis failed - defaulting to manual review',
      error: error.message
    };
  }
};

/**
 * Generate keyword suggestions for a blog post
 * @param {string} title - Post title
 * @param {string} content - Post content
 * @param {string} category - Post category
 * @returns {Object} Suggested keywords and tags
 */
export const generateKeywordSuggestions = async (title, content, category) => {
  if (!isConfigured()) {
    return {
      success: true,
      keywords: [],
      tags: [],
      message: 'OpenAI not configured'
    };
  }

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an SEO expert for a university blogging platform. 
          Generate relevant keywords and tags for blog posts.
          Focus on academic, educational, and university-related terms.
          
          Respond in JSON format:
          {
            "keywords": [array of 5-10 relevant keywords],
            "tags": [array of 3-5 short tags],
            "seoTitle": "optimized title suggestion",
            "metaDescription": "150 character meta description"
          }`
        },
        {
          role: 'user',
          content: `Title: ${title}\nCategory: ${category}\nContent: ${content.substring(0, 2000)}`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('OpenAI keyword generation error:', error.message);
    return {
      success: false,
      keywords: [],
      tags: [],
      message: 'Keyword generation failed',
      error: error.message
    };
  }
};

/**
 * Check content for spam patterns
 * @param {string} content - Content to check
 * @returns {Object} Spam analysis result
 */
export const detectSpam = async (content) => {
  if (!isConfigured()) {
    return { success: true, isSpam: false, confidence: 0 };
  }

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Analyze if the following content is spam. Look for:
          - Excessive links or promotional content
          - Repetitive text patterns
          - Irrelevant or off-topic content
          - Suspicious URLs or phishing attempts
          - Bot-generated content patterns
          
          Respond in JSON: {"isSpam": boolean, "confidence": number 0-100, "indicators": [array]}`
        },
        {
          role: 'user',
          content: content.substring(0, 2000)
        }
      ],
      max_tokens: 200,
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return { success: true, ...result };
  } catch (error) {
    console.error('Spam detection error:', error.message);
    return { success: false, isSpam: false, confidence: 0, error: error.message };
  }
};

/**
 * Generate content improvement suggestions
 * @param {string} content - Content to improve
 * @returns {Object} Improvement suggestions
 */
export const getContentSuggestions = async (content) => {
  if (!isConfigured()) {
    return { success: true, suggestions: [], message: 'OpenAI not configured' };
  }

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a writing assistant for academic blog posts. 
          Provide constructive suggestions to improve the content quality.
          Focus on: clarity, structure, grammar, academic tone, and engagement.
          
          Respond in JSON: {
            "overallScore": number 1-10,
            "suggestions": [array of specific improvements],
            "strengths": [array of positive aspects],
            "readabilityLevel": "easy" | "moderate" | "advanced"
          }`
        },
        {
          role: 'user',
          content: content.substring(0, 3000)
        }
      ],
      max_tokens: 400,
      temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return { success: true, ...result };
  } catch (error) {
    console.error('Content suggestions error:', error.message);
    return { success: false, suggestions: [], error: error.message };
  }
};

/**
 * Generate content paragraph suggestions based on title and category
 * Feature: ai-content-assistant
 * Requirements: 1.1, 1.2, 1.5
 * 
 * @param {string} title - Post title (minimum 5 characters)
 * @param {string} category - Post category
 * @returns {Object} Generated paragraph suggestions (2-3 paragraphs)
 */
export const generateContentParagraphs = async (title, category = 'general') => {
  if (!isConfigured()) {
    return {
      success: false,
      paragraphs: [],
      message: 'OpenAI not configured - cannot generate content suggestions'
    };
  }

  // Validate title length
  if (!title || title.length < 5) {
    return {
      success: false,
      paragraphs: [],
      message: 'Title must be at least 5 characters to generate suggestions'
    };
  }

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful writing assistant for a university blogging platform.
          Based on the given title and category, generate 2-3 paragraph suggestions that the author can use as starting points for their blog post.
          
          Each paragraph should:
          - Be relevant to the title and category
          - Be well-written and engaging
          - Be suitable for an academic/educational blog
          - Be 2-4 sentences long
          - Provide a different angle or section of the topic
          
          Respond in JSON format:
          {
            "paragraphs": [
              {
                "id": "p1",
                "text": "paragraph content here",
                "type": "introduction" | "body" | "conclusion"
              },
              {
                "id": "p2", 
                "text": "paragraph content here",
                "type": "introduction" | "body" | "conclusion"
              },
              {
                "id": "p3",
                "text": "paragraph content here",
                "type": "introduction" | "body" | "conclusion"
              }
            ]
          }
          
          Generate exactly 2-3 paragraphs. Make them helpful starting points that the author can expand upon.`
        },
        {
          role: 'user',
          content: `Title: ${title}\nCategory: ${category}`
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Ensure we have 2-3 paragraphs
    const paragraphs = result.paragraphs || [];
    if (paragraphs.length < 2) {
      return {
        success: false,
        paragraphs: [],
        message: 'Failed to generate enough paragraph suggestions'
      };
    }
    
    // Limit to 3 paragraphs max
    const limitedParagraphs = paragraphs.slice(0, 3);
    
    return {
      success: true,
      paragraphs: limitedParagraphs,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Content paragraph generation error:', error.message);
    return {
      success: false,
      paragraphs: [],
      message: 'Failed to generate content suggestions',
      error: error.message
    };
  }
};

/**
 * Summarize content for excerpt generation
 * @param {string} content - Content to summarize
 * @param {number} maxLength - Maximum summary length
 * @returns {Object} Generated summary
 */
export const generateExcerpt = async (content, maxLength = 200) => {
  if (!isConfigured()) {
    // Fallback: simple truncation
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return {
      success: true,
      excerpt: plainText.substring(0, maxLength) + (plainText.length > maxLength ? '...' : ''),
      message: 'OpenAI not configured - using simple truncation'
    };
  }

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Generate a compelling excerpt/summary for a blog post. 
          Keep it under ${maxLength} characters. Make it engaging and informative.
          Return only the excerpt text, no JSON.`
        },
        {
          role: 'user',
          content: content.substring(0, 2000)
        }
      ],
      max_tokens: 100,
      temperature: 0.6,
    });

    return {
      success: true,
      excerpt: response.choices[0].message.content.trim().substring(0, maxLength)
    };
  } catch (error) {
    console.error('Excerpt generation error:', error.message);
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return {
      success: false,
      excerpt: plainText.substring(0, maxLength) + '...',
      error: error.message
    };
  }
};

export default {
  isConfigured,
  analyzeContent,
  generateKeywordSuggestions,
  generateContentParagraphs,
  detectSpam,
  getContentSuggestions,
  generateExcerpt
};
