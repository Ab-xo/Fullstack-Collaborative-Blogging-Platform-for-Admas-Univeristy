/**
 * ============================================================================
 * CONTENT MODERATION SERVICE
 * ============================================================================
 * Automated content moderation using OpenAI and rule-based filtering
 */

import openaiService from './openaiService.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ==================== HARMFUL CONTENT PATTERNS ====================

const HARMFUL_PATTERNS = {
  // Profanity and vulgar language (basic list - expand as needed)
  profanity: [
    /\b(fuck|shit|damn|ass|bitch|bastard|crap)\b/gi,
    /\b(f\*ck|sh\*t|b\*tch)\b/gi,
  ],
  
  // Hate speech patterns
  hateSpeech: [
    /\b(hate|kill|murder|destroy)\s+(all|every)\s+\w+/gi,
    /\b(racial|ethnic)\s+(slur|insult)/gi,
  ],
  
  // Spam patterns
  spam: [
    /\b(buy now|click here|free money|act now|limited time)\b/gi,
    /\b(viagra|cialis|casino|lottery|winner)\b/gi,
    /(https?:\/\/[^\s]+){5,}/gi, // Multiple URLs
    /(.)\1{10,}/gi, // Repeated characters
  ],
  
  // Personal information patterns
  personalInfo: [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
    /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, // SSN-like patterns
  ],
  
  // Threats and violence
  threats: [
    /\b(i will|gonna|going to)\s+(kill|hurt|harm|attack)\b/gi,
    /\b(bomb|weapon|gun|knife)\s+(threat|attack)\b/gi,
  ],
};

// Severity levels
const SEVERITY = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// ==================== RULE-BASED CONTENT ANALYSIS ====================

/**
 * Analyze content using rule-based patterns
 * @param {string} content - Content to analyze
 * @returns {Object} Analysis result
 */
const ruleBasedAnalysis = (content) => {
  const flags = [];
  let severity = SEVERITY.NONE;
  
  // Check profanity
  for (const pattern of HARMFUL_PATTERNS.profanity) {
    const matches = content.match(pattern);
    if (matches) {
      flags.push({
        type: 'profanity',
        matches: matches.slice(0, 5), // Limit matches shown
        count: matches.length
      });
      severity = severity === SEVERITY.NONE ? SEVERITY.LOW : severity;
    }
  }
  
  // Check hate speech
  for (const pattern of HARMFUL_PATTERNS.hateSpeech) {
    const matches = content.match(pattern);
    if (matches) {
      flags.push({
        type: 'hate_speech',
        matches: matches.slice(0, 3),
        count: matches.length
      });
      severity = SEVERITY.HIGH;
    }
  }
  
  // Check spam
  for (const pattern of HARMFUL_PATTERNS.spam) {
    const matches = content.match(pattern);
    if (matches) {
      flags.push({
        type: 'spam',
        matches: matches.slice(0, 3),
        count: matches.length
      });
      severity = severity === SEVERITY.NONE ? SEVERITY.MEDIUM : severity;
    }
  }
  
  // Check personal info
  for (const pattern of HARMFUL_PATTERNS.personalInfo) {
    const matches = content.match(pattern);
    if (matches) {
      flags.push({
        type: 'personal_info',
        count: matches.length,
        warning: 'Content may contain personal information'
      });
      severity = severity === SEVERITY.NONE ? SEVERITY.MEDIUM : severity;
    }
  }
  
  // Check threats
  for (const pattern of HARMFUL_PATTERNS.threats) {
    const matches = content.match(pattern);
    if (matches) {
      flags.push({
        type: 'threats',
        matches: matches.slice(0, 3),
        count: matches.length
      });
      severity = SEVERITY.CRITICAL;
    }
  }
  
  return {
    flags,
    severity,
    flagCount: flags.length,
    isClean: flags.length === 0
  };
};

// ==================== MAIN MODERATION FUNCTIONS ====================

/**
 * Moderate content using both rule-based and AI analysis
 * @param {string} content - Content to moderate
 * @param {string} title - Content title
 * @param {Object} options - Moderation options
 * @returns {Object} Moderation result
 */
export const moderateContent = async (content, title = '', options = {}) => {
  const { useAI = true, strictMode = false } = options;
  
  // Step 1: Rule-based analysis (fast, always runs)
  const ruleResult = ruleBasedAnalysis(content + ' ' + title);
  
  // Step 2: AI analysis (if enabled and configured)
  let aiResult = null;
  if (useAI && openaiService.isConfigured()) {
    try {
      aiResult = await openaiService.analyzeContent(content + '\n\nTitle: ' + title);
    } catch (error) {
      console.error('AI moderation error:', error.message);
    }
  }
  
  // Combine results
  const combinedFlags = [...ruleResult.flags];
  let finalSeverity = ruleResult.severity;
  let recommendation = 'approve';
  
  if (aiResult?.success) {
    // Add AI flags
    if (aiResult.flags?.length > 0) {
      combinedFlags.push(...aiResult.flags.map(f => ({
        type: 'ai_detected',
        issue: f,
        source: 'openai'
      })));
    }
    
    // Update severity based on AI
    if (aiResult.severity === 'critical') finalSeverity = SEVERITY.CRITICAL;
    else if (aiResult.severity === 'high' && finalSeverity !== SEVERITY.CRITICAL) finalSeverity = SEVERITY.HIGH;
    else if (aiResult.severity === 'medium' && finalSeverity === SEVERITY.NONE) finalSeverity = SEVERITY.MEDIUM;
    
    // Use AI recommendation if available
    if (aiResult.recommendation) {
      recommendation = aiResult.recommendation;
    }
  }
  
  // Determine final recommendation based on severity
  if (finalSeverity === SEVERITY.CRITICAL) {
    recommendation = 'reject';
  } else if (finalSeverity === SEVERITY.HIGH) {
    recommendation = strictMode ? 'reject' : 'review';
  } else if (finalSeverity === SEVERITY.MEDIUM) {
    recommendation = 'review';
  } else if (finalSeverity === SEVERITY.LOW) {
    recommendation = strictMode ? 'review' : 'approve';
  }
  
  return {
    success: true,
    isAppropriate: combinedFlags.length === 0,
    flags: combinedFlags,
    severity: finalSeverity,
    recommendation,
    ruleBasedResult: ruleResult,
    aiResult: aiResult || { message: 'AI analysis not performed' },
    moderatedAt: new Date().toISOString()
  };
};

/**
 * Report content to moderators
 * @param {Object} params - Report parameters
 */
export const reportToModerators = async ({ postId, postTitle, authorId, reason, flags, severity, reportedBy }) => {
  try {
    // Find all moderators and admins
    const moderators = await User.find({
      $or: [
        { role: { $in: ['admin', 'moderator'] } },
        { roles: { $in: ['admin', 'moderator'] } }
      ],
      isActive: true
    }).select('_id');
    
    // Create notifications for each moderator
    const notifications = moderators.map(mod => ({
      recipient: mod._id,
      sender: reportedBy || null,
      type: 'content_flagged',
      title: `Content Flagged: ${severity.toUpperCase()}`,
      message: `Post "${postTitle}" has been flagged for review. Reason: ${reason}`,
      link: `/admin/moderation/${postId}`,
      metadata: {
        postId,
        postTitle,
        authorId,
        flags,
        severity,
        reason
      },
      priority: severity === 'critical' ? 'high' : 'normal'
    }));
    
    await Notification.insertMany(notifications);
    
    console.log(`📢 Content flagged: ${postTitle} - Notified ${moderators.length} moderators`);
    
    return {
      success: true,
      notifiedCount: moderators.length
    };
  } catch (error) {
    console.error('Error reporting to moderators:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Auto-moderate a post before publishing
 * @param {Object} post - Post object
 * @param {Object} options - Moderation options
 * @returns {Object} Moderation decision
 */
export const autoModeratePost = async (post, options = {}) => {
  const { autoReject = false, notifyModerators = true } = options;
  
  const result = await moderateContent(post.content, post.title, {
    useAI: true,
    strictMode: autoReject
  });
  
  // If content is flagged and notification is enabled
  if (!result.isAppropriate && notifyModerators) {
    await reportToModerators({
      postId: post._id,
      postTitle: post.title,
      authorId: post.author,
      reason: result.flags.map(f => f.type || f.issue).join(', '),
      flags: result.flags,
      severity: result.severity
    });
  }
  
  return {
    ...result,
    action: result.recommendation === 'reject' ? 'blocked' : 
            result.recommendation === 'review' ? 'pending_review' : 'approved'
  };
};

/**
 * Filter harmful content from text (sanitize)
 * @param {string} content - Content to filter
 * @returns {string} Filtered content
 */
export const filterHarmfulContent = (content) => {
  let filtered = content;
  
  // Replace profanity with asterisks
  for (const pattern of HARMFUL_PATTERNS.profanity) {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  }
  
  // Mask personal information
  for (const pattern of HARMFUL_PATTERNS.personalInfo) {
    filtered = filtered.replace(pattern, '[REDACTED]');
  }
  
  return filtered;
};

/**
 * Get moderation statistics
 * @returns {Object} Moderation stats
 */
export const getModerationStats = async () => {
  // This would typically query the database for moderation history
  return {
    totalModerated: 0,
    approved: 0,
    rejected: 0,
    pendingReview: 0,
    flaggedByAI: 0,
    flaggedByRules: 0
  };
};

export default {
  moderateContent,
  reportToModerators,
  autoModeratePost,
  filterHarmfulContent,
  getModerationStats,
  SEVERITY
};
