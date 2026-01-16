/**
 * ============================================================================
 * AI SUGGESTIONS PANEL
 * ============================================================================
 * A collapsible panel that displays AI-powered writing suggestions including:
 * - Keyword recommendations
 * - Content quality score
 * - Readability level
 * - Improvement suggestions
 * - Real-time violation detection
 *
 * Feature: moderator-dashboard-ai-suggestions
 * Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  BarChart3,
  BookOpen,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  X,
  Zap,
  TrendingUp,
  Info,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { aiAPI } from "../../api/ai";

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 1500;
const VIOLATION_CHECK_DELAY = 2000; // Slightly longer for violation checks
const MIN_CONTENT_LENGTH = 50;
const MIN_TITLE_LENGTH = 5;

/**
 * Get severity badge styling for violations
 */
const getSeverityConfig = (severity) => {
  switch (severity) {
    case "critical":
      return {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: AlertCircle,
        label: "Critical",
      };
    case "high":
      return {
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        icon: AlertTriangle,
        label: "High",
      };
    case "medium":
      return {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: AlertTriangle,
        label: "Medium",
      };
    case "low":
      return {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        icon: Info,
        label: "Low",
      };
    default:
      return {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: ShieldCheck,
        label: "Clean",
      };
  }
};

/**
 * Get color class based on quality score
 */
const getScoreColor = (score) => {
  if (score >= 8) return "text-green-600 bg-green-100 dark:bg-green-900/30";
  if (score >= 6) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
  if (score >= 4) return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
  return "text-red-600 bg-red-100 dark:bg-red-900/30";
};

/**
 * Get readability badge color
 */
const getReadabilityColor = (level) => {
  switch (level) {
    case "easy":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "moderate":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "advanced":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
};

/**
 * AI Suggestions Panel Component
 */
const AISuggestionsPanel = ({
  title = "",
  content = "",
  category = "general",
  isCollapsed: initialCollapsed = false,
  onToggleCollapse,
  className = "",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [lastFetchedContent, setLastFetchedContent] = useState("");
  const [violations, setViolations] = useState(null);
  const [violationLoading, setViolationLoading] = useState(false);
  const [lastCheckedContent, setLastCheckedContent] = useState("");
  const debounceRef = useRef(null);
  const violationDebounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Handle collapse toggle
  const handleToggle = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggleCollapse?.(newState);
  }, [isCollapsed, onToggleCollapse]);

  // Fetch AI suggestions
  const fetchSuggestions = useCallback(async () => {
    // Validate minimum requirements
    if (
      title.length < MIN_TITLE_LENGTH ||
      content.length < MIN_CONTENT_LENGTH
    ) {
      return;
    }

    // Skip if content hasn't changed significantly
    const contentKey = `${title}|${content.substring(0, 200)}`;
    if (contentKey === lastFetchedContent) {
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // Fetch keyword suggestions
      const keywordResult = await aiAPI.getKeywordSuggestions(
        title,
        content,
        category
      );

      // Fetch content analysis
      const analysisResult = await aiAPI.analyzeContent(content, title);

      if (keywordResult.success || analysisResult.success) {
        setSuggestions({
          keywords: keywordResult.data?.keywords || [],
          tags: keywordResult.data?.tags || [],
          seoTitle: keywordResult.data?.seoTitle,
          metaDescription: keywordResult.data?.metaDescription,
          qualityScore: analysisResult.data?.suggestions?.overallScore || 0,
          readabilityLevel:
            analysisResult.data?.suggestions?.readabilityLevel || "moderate",
          improvements: analysisResult.data?.suggestions?.suggestions || [],
          strengths: analysisResult.data?.suggestions?.strengths || [],
          moderation: analysisResult.data?.moderation,
        });
        setLastFetchedContent(contentKey);
      } else {
        setError("Unable to generate suggestions. Please try again.");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("[AISuggestionsPanel] Error:", err);
        setError("Failed to load AI suggestions");
      }
    } finally {
      setLoading(false);
    }
  }, [title, content, category, lastFetchedContent]);

  // Check for violations
  const checkViolations = useCallback(async () => {
    // Validate minimum requirements
    if (
      title.length < MIN_TITLE_LENGTH ||
      content.length < MIN_CONTENT_LENGTH
    ) {
      return;
    }

    // Skip if content hasn't changed significantly
    const contentKey = `${title}|${content.substring(0, 300)}`;
    if (contentKey === lastCheckedContent) {
      return;
    }

    setViolationLoading(true);

    try {
      // Check for violations - notify moderators for high/critical severity
      const result = await aiAPI.checkViolations(title, content, true);

      if (result.success) {
        setViolations(result.data);
        setLastCheckedContent(contentKey);
      }
    } catch (err) {
      console.error("[AISuggestionsPanel] Violation check error:", err);
    } finally {
      setViolationLoading(false);
    }
  }, [title, content, lastCheckedContent]);

  // Debounced fetch effect
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only fetch if we have enough content
    if (
      title.length >= MIN_TITLE_LENGTH &&
      content.length >= MIN_CONTENT_LENGTH
    ) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions();
      }, DEBOUNCE_DELAY);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [title, content, category, fetchSuggestions]);

  // Debounced violation check effect
  useEffect(() => {
    // Clear previous timeout
    if (violationDebounceRef.current) {
      clearTimeout(violationDebounceRef.current);
    }

    // Only check if we have enough content
    if (
      title.length >= MIN_TITLE_LENGTH &&
      content.length >= MIN_CONTENT_LENGTH
    ) {
      violationDebounceRef.current = setTimeout(() => {
        checkViolations();
      }, VIOLATION_CHECK_DELAY);
    }

    return () => {
      if (violationDebounceRef.current) {
        clearTimeout(violationDebounceRef.current);
      }
    };
  }, [title, content, checkViolations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Check if we have enough content to show suggestions
  const hasEnoughContent =
    title.length >= MIN_TITLE_LENGTH && content.length >= MIN_CONTENT_LENGTH;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            AI Writing Assistant
          </span>
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
          )}
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Not enough content message */}
              {!hasEnoughContent && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium">
                      Start writing to get AI suggestions
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 mt-1">
                      Add a title (min {MIN_TITLE_LENGTH} chars) and content
                      (min {MIN_CONTENT_LENGTH} chars) to receive personalized
                      writing suggestions.
                    </p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </span>
                  <button
                    onClick={fetchSuggestions}
                    className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <RefreshCw className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}

              {/* Loading state */}
              {loading && !suggestions && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-purple-200 dark:border-purple-900" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Analyzing your content...
                  </p>
                </div>
              )}

              {/* Violation Check Section */}
              {hasEnoughContent && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Content Guidelines
                      </span>
                    </div>
                    {violationLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    )}
                  </div>

                  {violations && !violationLoading && (
                    <div
                      className={`p-3 rounded-lg ${
                        violations.isClean
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                          : violations.severity === "critical" ||
                            violations.severity === "high"
                          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                          : violations.severity === "medium"
                          ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                          : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      {violations.isClean ? (
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                              Content looks good!
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              No violations detected
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const config = getSeverityConfig(
                                violations.severity
                              );
                              const Icon = config.icon;
                              return (
                                <>
                                  <Icon
                                    className={`w-5 h-5 ${
                                      violations.severity === "critical" ||
                                      violations.severity === "high"
                                        ? "text-red-600 dark:text-red-400"
                                        : violations.severity === "medium"
                                        ? "text-yellow-600 dark:text-yellow-400"
                                        : "text-blue-600 dark:text-blue-400"
                                    }`}
                                  />
                                  <span
                                    className={`text-sm font-medium px-2 py-0.5 rounded-full ${config.color}`}
                                  >
                                    {config.label} Severity
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {violations.violations?.length || 0} potential
                            issue(s) detected
                          </p>
                          {violations.violations?.slice(0, 3).map((v, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 pl-2"
                            >
                              <span className="text-red-500">•</span>
                              <span>{v.description}</span>
                            </div>
                          ))}
                          {(violations.severity === "critical" ||
                            violations.severity === "high") && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Moderators have been notified
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions content */}
              {suggestions && hasEnoughContent && (
                <>
                  {/* Quality Score & Readability */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Quality Score */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Quality Score
                        </span>
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-lg font-bold ${getScoreColor(
                          suggestions.qualityScore
                        )}`}
                      >
                        <Zap className="w-4 h-4" />
                        {suggestions.qualityScore}/10
                      </div>
                    </div>

                    {/* Readability */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Readability
                        </span>
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded-lg text-sm font-medium capitalize ${getReadabilityColor(
                          suggestions.readabilityLevel
                        )}`}
                      >
                        {suggestions.readabilityLevel}
                      </span>
                    </div>
                  </div>

                  {/* Keywords */}
                  {suggestions.keywords?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Suggested Keywords
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.keywords
                          .slice(0, 8)
                          .map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                              title="Click to copy"
                              onClick={() =>
                                navigator.clipboard.writeText(keyword)
                              }
                            >
                              {keyword}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {suggestions.tags?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Suggested Tags
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {suggestions.strengths?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Strengths
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {suggestions.strengths
                          .slice(0, 3)
                          .map((strength, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                            >
                              <span className="text-green-500 mt-1">✓</span>
                              {strength}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvement Suggestions */}
                  {suggestions.improvements?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Suggestions
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {suggestions.improvements
                          .slice(0, 4)
                          .map((suggestion, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300 group cursor-help"
                              title="Click for more details"
                            >
                              <span className="text-yellow-500 mt-0.5">💡</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* SEO Suggestions */}
                  {suggestions.seoTitle && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          SEO Title Suggestion
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        "{suggestions.seoTitle}"
                      </p>
                    </div>
                  )}

                  {/* Refresh button */}
                  <button
                    onClick={fetchSuggestions}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    {loading ? "Analyzing..." : "Refresh Suggestions"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AISuggestionsPanel;
