/**
 * ============================================================================
 * AI ROUTES
 * ============================================================================
 * Routes for AI-powered features: keyword suggestions, content analysis, etc.
 * Supports multiple AI providers with automatic fallback:
 * - OpenAI (if configured)
 * - Groq (free tier available)
 * - Ollama (local, free)
 * - HuggingFace (free tier)
 */

import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { advancedAILimiter, aiFeatureLimiter } from '../middleware/rateLimitMiddleware.js';
import aiService from '../services/aiService.js';
import contentModerationService from '../services/contentModerationService.js';
import violationDetectionService from '../services/violationDetectionService.js';
import AuditLogService from '../services/auditLogService.js';

const router = express.Router();

/**
 * @route   POST /api/ai/generate-content
 * @desc    Generate paragraph suggestions based on title and category
 * @access  Private (Authors)
 * Feature: ai-content-assistant
 * Requirements: 1.1, 1.2
 */
router.post('/generate-content', protect, aiFeatureLimiter, advancedAILimiter, async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!title || title.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 5 characters'
      });
    }

    const result = await aiService.generateContentParagraphs(title, category || 'general');

    // Log action
    await AuditLogService.logAISuggestion(req.user._id, category, req);

    // Always return success - we have built-in fallback
    res.json({
      success: true,
      data: {
        paragraphs: result.paragraphs || [],
        generatedAt: result.generatedAt || new Date().toISOString(),
        provider: result.provider || 'builtin',
        message: result.message
      }
    });
  } catch (error) {
    console.error('Content generation error:', error);
    // Even on error, try to return something useful
    res.json({
      success: true,
      data: {
        paragraphs: [
          { id: 'p1', text: 'Start your blog post with an engaging introduction that captures the reader\'s attention.', type: 'introduction' },
          { id: 'p2', text: 'Develop your main points with clear explanations and relevant examples.', type: 'body' },
          { id: 'p3', text: 'Conclude with a summary of key takeaways and a call to action for your readers.', type: 'conclusion' }
        ],
        generatedAt: new Date().toISOString(),
        provider: 'fallback',
        message: 'Using default suggestions'
      }
    });
  }
});

/**
 * @route   POST /api/ai/check-violations
 * @desc    Check content for rule violations before submission
 * @access  Private (Authors)
 * Feature: ai-content-assistant
 * Requirements: 3.1, 3.2
 */
router.post('/check-violations', protect, aiFeatureLimiter, advancedAILimiter, async (req, res) => {
  try {
    const { title, content, notifyModerators } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const violationReport = await violationDetectionService.analyzeForViolations(title, content);

    // If violations detected and notifyModerators flag is set, alert moderators
    if (notifyModerators && violationReport.hasViolations &&
      (violationReport.severity === 'high' || violationReport.severity === 'critical')) {
      try {
        // Import User model to get moderator IDs
        const User = (await import('../models/User.js')).default;
        const moderators = await User.find({
          roles: { $in: ['moderator', 'admin'] },
          status: 'active'
        }).select('_id');

        const moderatorIds = moderators.map(m => m._id);

        if (moderatorIds.length > 0) {
          const NotificationService = (await import('../services/notificationService.js')).default;
          await NotificationService.notifyModeratorsViolation(moderatorIds, {
            authorId: req.user._id,
            authorName: `${req.user.firstName} ${req.user.lastName}`,
            title,
            severity: violationReport.severity,
            violations: violationReport.violations
          });
        }
      } catch (notifyError) {
        console.error('Error notifying moderators:', notifyError);
        // Don't fail the request if notification fails
      }
    }

    res.json({
      success: true,
      data: violationReport
    });
  } catch (error) {
    console.error('Violation check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking for violations',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/keywords
 * @desc    Generate keyword suggestions for a blog post
 * @access  Private (Authors)
 */
router.post('/keywords', protect, aiFeatureLimiter, advancedAILimiter, async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const result = await aiService.generateKeywordSuggestions(title, content, category || 'general');

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Keyword generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating keywords',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/analyze
 * @desc    Analyze content for quality and appropriateness
 * @access  Private (Authors)
 */
router.post('/analyze', protect, aiFeatureLimiter, advancedAILimiter, async (req, res) => {
  try {
    const { content, title } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Run content moderation
    const moderationResult = await contentModerationService.moderateContent(content, title || '');

    // Get content suggestions
    const suggestions = await aiService.getContentSuggestions(content);

    res.json({
      success: true,
      data: {
        moderation: moderationResult,
        suggestions: suggestions
      }
    });
  } catch (error) {
    console.error('Content analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing content',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/moderate
 * @desc    Check content for harmful/inappropriate material
 * @access  Private (Authors, Moderators, Admins)
 */
router.post('/moderate', protect, aiFeatureLimiter, advancedAILimiter, async (req, res) => {
  try {
    const { content, title, strictMode } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const result = await contentModerationService.moderateContent(content, title || '', {
      useAI: true,
      strictMode: strictMode || false
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Content moderation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating content',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/excerpt
 * @desc    Generate an excerpt/summary for content
 * @access  Private (Authors)
 */
router.post('/excerpt', protect, aiFeatureLimiter, advancedAILimiter, async (req, res) => {
  try {
    const { content, maxLength } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const result = await aiService.generateExcerpt(content, maxLength || 200);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Excerpt generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating excerpt',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/spam-check
 * @desc    Check content for spam patterns
 * @access  Private
 */
router.post('/spam-check', protect, aiFeatureLimiter, advancedAILimiter, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const result = await aiService.detectSpam(content);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Spam check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking for spam',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/report
 * @desc    Report inappropriate content to moderators
 * @access  Private
 */
router.post('/report', protect, async (req, res) => {
  try {
    const { postId, postTitle, authorId, reason } = req.body;

    if (!postId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and reason are required'
      });
    }

    // First, analyze the content
    const moderationResult = await contentModerationService.moderateContent(reason, postTitle || '');

    // Report to moderators
    const reportResult = await contentModerationService.reportToModerators({
      postId,
      postTitle: postTitle || 'Unknown',
      authorId,
      reason,
      flags: moderationResult.flags,
      severity: moderationResult.severity,
      reportedBy: req.user._id
    });

    res.json({
      success: true,
      message: 'Content reported successfully',
      data: reportResult
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reporting content',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/status
 * @desc    Check AI service status
 * @access  Private (Admin)
 */
router.get('/status', protect, authorize('admin'), async (_req, res) => {
  try {
    const status = aiService.getStatus();

    res.json({
      success: true,
      data: {
        configured: status.configured,
        providers: status.providers,
        primaryProvider: status.primaryProvider,
        openai: {
          configured: status.providers.includes('openai'),
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
        },
        groq: {
          configured: status.providers.includes('groq'),
          model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile'
        },
        ollama: {
          configured: status.providers.includes('ollama'),
          url: process.env.OLLAMA_URL || 'http://localhost:11434'
        },
        features: {
          keywordSuggestions: status.configured,
          contentAnalysis: status.configured,
          spamDetection: status.configured,
          excerptGeneration: status.configured,
          contentModeration: true // Rule-based always available
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking AI status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/grammar
 * @desc    Check content for grammar and spelling errors
 * @access  Private (Authors)
 */
router.post('/grammar', protect, aiFeatureLimiter, advancedAILimiter, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const result = await aiService.checkGrammar(content);

    // Log action
    await AuditLogService.logAIGrammarCheck(req.user._id, req);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking grammar', error: error.message });
  }
});

/**
 * @route   POST /api/ai/improve
 * @desc    Improve content flow and vocabulary
 * @access  Private (Authors)
 */
router.post('/improve', protect, aiFeatureLimiter, advancedAILimiter, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const result = await aiService.improveContent(content);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error improving content', error: error.message });
  }
});

/**
 * @route   POST /api/ai/topics
 * @desc    Generate topic ideas based on category
 * @access  Private (Authors)
 */
router.post('/topics', protect, aiFeatureLimiter, advancedAILimiter, async (req, res) => {
  try {
    const { category } = req.body;
    const result = await aiService.generateTopicIdeas(category || 'general');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating topics', error: error.message });
  }
});

/**
 * @route   POST /api/ai/chat
 * @desc    Interactive chat assistant
 * @access  Private
 */
router.post('/chat', protect, aiFeatureLimiter, advancedAILimiter, async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const result = await aiService.chatWithAssistant(message, context || '');

    // Log action
    await AuditLogService.logAIChatInteraction(req.user._id, req);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in chat assistant', error: error.message });
  }
});

export default router;
