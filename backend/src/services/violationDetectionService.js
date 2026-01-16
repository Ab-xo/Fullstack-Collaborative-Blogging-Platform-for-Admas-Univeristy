/**
 * ============================================================================
 * VIOLATION DETECTION SERVICE
 * ============================================================================
 * AI-powered content violation detection for blog posts
 * Analyzes content against blog rules and generates violation reports
 * 
 * Feature: ai-content-assistant
 * Requirements: 3.1, 3.2, 4.1, 4.2, 4.4
 * 
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import openaiService from './openaiService.js';

// Violation types
const VIOLATION_TYPES = {
  HATE_SPEECH: 'hate_speech',
  SPAM: 'spam',
  INAPPROPRIATE_CONTENT: 'inappropriate_content',
  PERSONAL_ATTACKS: 'personal_attacks',
  PLAGIARISM: 'plagiarism',
  PROFANITY: 'profanity',
  HARASSMENT: 'harassment',
  VIOLENCE: 'violence',
  MISLEADING: 'misleading_information'
};

// Severity levels with priority order
const SEVERITY_LEVELS = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Severity priority for sorting (higher = more severe)
const SEVERITY_PRIORITY = {
  'critical': 4,
  'high': 3,
  'medium': 2,
  'low': 1,
  'none': 0
};

// Rule-based patterns for quick detection
const VIOLATION_PATTERNS = {
  profanity: [
    /\b(fuck|shit|damn|ass|bitch|bastard|crap)\b/gi,
    /\b(f\*ck|sh\*t|b\*tch|a\*\*)\b/gi,
  ],
  hateSpeech: [
    /\b(hate|kill|murder|destroy)\s+(all|every)\s+\w+/gi,
    /\b(racial|ethnic)\s+(slur|insult)/gi,
  ],
  spam: [
    /\b(buy now|click here|free money|act now|limited time)\b/gi,
    /\b(viagra|cialis|casino|lottery|winner)\b/gi,
    /(https?:\/\/[^\s]+){5,}/gi,
  ],
  personalAttacks: [
    /\b(you are|you're)\s+(stupid|idiot|moron|dumb)\b/gi,
    /\b(shut up|go away|nobody cares)\b/gi,
  ],
  violence: [
    /\b(i will|gonna|going to)\s+(kill|hurt|harm|attack)\b/gi,
    /\b(bomb|weapon|gun|knife)\s+(threat|attack)\b/gi,
  ]
};

/**
 * Perform rule-based violation detection (fast, always runs)
 * @param {string} content - Content to analyze
 * @param {string} title - Post title
 * @returns {Object} Rule-based analysis result
 */
const ruleBasedDetection = (content, title = '') => {
  const fullText = `${title} ${content}`;
  const violations = [];
  let maxSeverity = SEVERITY_LEVELS.NONE;

  // Check profanity
  for (const pattern of VIOLATION_PATTERNS.profanity) {
    const matches = fullText.match(pattern);
    if (matches) {
      violations.push({
        type: VIOLATION_TYPES.PROFANITY,
        description: 'Profanity or vulgar language detected',
        excerpt: matches.slice(0, 3).join(', '),
        location: 'content',
        count: matches.length
      });
      if (SEVERITY_PRIORITY[maxSeverity] < SEVERITY_PRIORITY['low']) {
        maxSeverity = SEVERITY_LEVELS.LOW;
      }
    }
  }

  // Check hate speech
  for (const pattern of VIOLATION_PATTERNS.hateSpeech) {
    const matches = fullText.match(pattern);
    if (matches) {
      violations.push({
        type: VIOLATION_TYPES.HATE_SPEECH,
        description: 'Potential hate speech or discriminatory content',
        excerpt: matches.slice(0, 2).join(', '),
        location: 'content',
        count: matches.length
      });
      maxSeverity = SEVERITY_LEVELS.HIGH;
    }
  }

  // Check spam
  for (const pattern of VIOLATION_PATTERNS.spam) {
    const matches = fullText.match(pattern);
    if (matches) {
      violations.push({
        type: VIOLATION_TYPES.SPAM,
        description: 'Spam or promotional content detected',
        excerpt: matches.slice(0, 2).join(', '),
        location: 'content',
        count: matches.length
      });
      if (SEVERITY_PRIORITY[maxSeverity] < SEVERITY_PRIORITY['medium']) {
        maxSeverity = SEVERITY_LEVELS.MEDIUM;
      }
    }
  }

  // Check personal attacks
  for (const pattern of VIOLATION_PATTERNS.personalAttacks) {
    const matches = fullText.match(pattern);
    if (matches) {
      violations.push({
        type: VIOLATION_TYPES.PERSONAL_ATTACKS,
        description: 'Personal attacks or insults detected',
        excerpt: matches.slice(0, 2).join(', '),
        location: 'content',
        count: matches.length
      });
      if (SEVERITY_PRIORITY[maxSeverity] < SEVERITY_PRIORITY['medium']) {
        maxSeverity = SEVERITY_LEVELS.MEDIUM;
      }
    }
  }

  // Check violence
  for (const pattern of VIOLATION_PATTERNS.violence) {
    const matches = fullText.match(pattern);
    if (matches) {
      violations.push({
        type: VIOLATION_TYPES.VIOLENCE,
        description: 'Violent or threatening content detected',
        excerpt: matches.slice(0, 2).join(', '),
        location: 'content',
        count: matches.length
      });
      maxSeverity = SEVERITY_LEVELS.CRITICAL;
    }
  }

  return {
    violations,
    severity: maxSeverity,
    source: 'rule-based'
  };
};

/**
 * Perform AI-based violation detection using OpenAI
 * @param {string} content - Content to analyze
 * @param {string} title - Post title
 * @returns {Object} AI analysis result
 */
const aiBasedDetection = async (content, title = '') => {
  if (!openaiService.isConfigured()) {
    return {
      violations: [],
      severity: SEVERITY_LEVELS.NONE,
      source: 'ai',
      message: 'AI analysis not available'
    };
  }

  try {
    const result = await openaiService.analyzeContent(`Title: ${title}\n\nContent: ${content}`);
    
    if (!result.success) {
      return {
        violations: [],
        severity: SEVERITY_LEVELS.NONE,
        source: 'ai',
        message: 'AI analysis failed'
      };
    }

    // Convert AI flags to violation format
    const violations = (result.flags || []).map((flag, index) => ({
      type: mapAIFlagToViolationType(flag),
      description: flag,
      excerpt: '',
      location: 'content',
      source: 'ai'
    }));

    return {
      violations,
      severity: result.severity || SEVERITY_LEVELS.NONE,
      source: 'ai',
      recommendation: result.recommendation,
      confidence: result.confidence
    };
  } catch (error) {
    console.error('AI violation detection error:', error);
    return {
      violations: [],
      severity: SEVERITY_LEVELS.NONE,
      source: 'ai',
      error: error.message
    };
  }
};

/**
 * Map AI flag string to violation type
 * @param {string} flag - AI detected flag
 * @returns {string} Violation type
 */
const mapAIFlagToViolationType = (flag) => {
  const flagLower = flag.toLowerCase();
  if (flagLower.includes('hate') || flagLower.includes('discriminat')) return VIOLATION_TYPES.HATE_SPEECH;
  if (flagLower.includes('spam') || flagLower.includes('promot')) return VIOLATION_TYPES.SPAM;
  if (flagLower.includes('profan') || flagLower.includes('vulgar')) return VIOLATION_TYPES.PROFANITY;
  if (flagLower.includes('harass') || flagLower.includes('bully')) return VIOLATION_TYPES.HARASSMENT;
  if (flagLower.includes('violen') || flagLower.includes('threat')) return VIOLATION_TYPES.VIOLENCE;
  if (flagLower.includes('personal') || flagLower.includes('attack')) return VIOLATION_TYPES.PERSONAL_ATTACKS;
  if (flagLower.includes('plagiar')) return VIOLATION_TYPES.PLAGIARISM;
  if (flagLower.includes('mislead') || flagLower.includes('false')) return VIOLATION_TYPES.MISLEADING;
  return VIOLATION_TYPES.INAPPROPRIATE_CONTENT;
};

/**
 * Analyze content for violations and generate a violation report
 * Feature: ai-content-assistant
 * Requirements: 3.1, 3.2, 4.1, 4.2
 * 
 * @param {string} title - Post title
 * @param {string} content - Post content
 * @param {Object} options - Analysis options
 * @returns {Object} Violation report
 */
export const analyzeForViolations = async (title, content, options = {}) => {
  const { useAI = true } = options;
  
  // Step 1: Rule-based detection (fast)
  const ruleResult = ruleBasedDetection(content, title);
  
  // Step 2: AI-based detection (if enabled)
  let aiResult = { violations: [], severity: SEVERITY_LEVELS.NONE };
  if (useAI) {
    aiResult = await aiBasedDetection(content, title);
  }
  
  // Combine violations from both sources
  const allViolations = [...ruleResult.violations];
  
  // Add AI violations that aren't duplicates
  for (const aiViolation of aiResult.violations) {
    const isDuplicate = allViolations.some(v => v.type === aiViolation.type);
    if (!isDuplicate) {
      allViolations.push(aiViolation);
    }
  }
  
  // Determine final severity (take the highest)
  let finalSeverity = SEVERITY_LEVELS.NONE;
  if (SEVERITY_PRIORITY[ruleResult.severity] > SEVERITY_PRIORITY[finalSeverity]) {
    finalSeverity = ruleResult.severity;
  }
  if (SEVERITY_PRIORITY[aiResult.severity] > SEVERITY_PRIORITY[finalSeverity]) {
    finalSeverity = aiResult.severity;
  }
  
  // Build the violation report
  const hasViolations = allViolations.length > 0;
  const isClean = !hasViolations;
  
  return {
    hasViolations,
    isClean,
    severity: finalSeverity,
    violations: allViolations,
    analyzedAt: new Date().toISOString(),
    sources: {
      ruleBased: ruleResult.violations.length > 0,
      ai: aiResult.violations.length > 0
    }
  };
};

/**
 * Sort posts by violation severity (critical first)
 * Feature: ai-content-assistant
 * Requirements: 4.3
 * 
 * @param {Array} posts - Array of posts with violationReport
 * @returns {Array} Sorted posts
 */
export const sortByViolationSeverity = (posts) => {
  return [...posts].sort((a, b) => {
    const severityA = a.violationReport?.severity || 'none';
    const severityB = b.violationReport?.severity || 'none';
    return SEVERITY_PRIORITY[severityB] - SEVERITY_PRIORITY[severityA];
  });
};

/**
 * Get severity color for UI display
 * @param {string} severity - Severity level
 * @returns {string} Color class
 */
export const getSeverityColor = (severity) => {
  switch (severity) {
    case SEVERITY_LEVELS.CRITICAL: return 'red';
    case SEVERITY_LEVELS.HIGH: return 'orange';
    case SEVERITY_LEVELS.MEDIUM: return 'yellow';
    case SEVERITY_LEVELS.LOW: return 'blue';
    default: return 'green';
  }
};

export default {
  analyzeForViolations,
  sortByViolationSeverity,
  getSeverityColor,
  VIOLATION_TYPES,
  SEVERITY_LEVELS,
  SEVERITY_PRIORITY
};
