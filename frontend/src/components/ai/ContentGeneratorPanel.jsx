/**
 * ============================================================================
 * CONTENT GENERATOR PANEL
 * ============================================================================
 * AI-powered content generation panel that suggests paragraph content
 * based on the post title and category. Replaces the old AISuggestionsPanel
 * with a simpler, more focused interface.
 *
 * Feature: ai-content-assistant
 * Requirements: 1.1, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3
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
  Loader2,
  RefreshCw,
  Plus,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  FileText,
  CheckCircle2,
  Wand2,
  BrainCircuit,
  Type,
} from "lucide-react";
import apiClient from "../../api/client";

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 1500;
const MIN_TITLE_LENGTH = 5;

/**
 * Content Generator Panel Component
 * Generates paragraph suggestions based on title and category
 */
const ContentGeneratorPanel = ({
  title = "",
  category = "general",
  onInsertContent,
  content = "",
  isCollapsed: initialCollapsed = false,
  onToggleCollapse,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("generate"); // generate, grammar, improve, topics
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paragraphs, setParagraphs] = useState([]);
  const [grammarErrors, setGrammarErrors] = useState([]);
  const [improvedContent, setImprovedContent] = useState("");
  const [topicIdeas, setTopicIdeas] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [lastGeneratedTitle, setLastGeneratedTitle] = useState("");
  const debounceRef = useRef(null);

  // Handle collapse toggle
  const handleToggle = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggleCollapse?.(newState);
  }, [isCollapsed, onToggleCollapse]);

  // Generate content suggestions
  const generateContent = useCallback(
    async (forceRegenerate = false) => {
      // Validate minimum title length
      if (title.length < MIN_TITLE_LENGTH) {
        return;
      }

      // Skip if title hasn't changed (unless force regenerate)
      if (!forceRegenerate && title === lastGeneratedTitle) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post("/ai/generate-content", {
          title,
          category,
        });

        if (response.data?.success) {
          const data = response.data.data;
          if (data?.paragraphs && data.paragraphs.length > 0) {
            setParagraphs(data.paragraphs);
            setLastGeneratedTitle(title);
            setError(null);
          } else if (data?.message) {
            // OpenAI not configured - show info message instead of error
            setError(data.message);
            setParagraphs([]);
          } else {
            setError("No suggestions generated. Try a different title.");
            setParagraphs([]);
          }
        } else {
          setError(response.data?.message || "Failed to generate suggestions");
        }
      } catch (err) {
        console.error("[ContentGeneratorPanel] Error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to generate content suggestions"
        );
      } finally {
        setLoading(false);
      }
    },
    [title, category, lastGeneratedTitle]
  );

  // Check Grammar
  const checkGrammar = async () => {
    if (!content || content.length < 20) {
      setError("Please write more content to check grammar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/ai/grammar", { content });
      if (response.data?.success) {
        setGrammarErrors(response.data.data.errors || []);
        if (response.data.data.errors?.length === 0) {
          setError("No obvious grammar issues found!");
        }
      }
    } catch (err) {
      setError("Failed to check grammar.");
    } finally {
      setLoading(false);
    }
  };

  // Improve Content
  const improveContent = async () => {
    if (!content || content.length < 20) {
      setError("Please write more content to improve.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/ai/improve", { content });
      if (response.data?.success) {
        setImprovedContent(response.data.data.improvedContent);
      }
    } catch (err) {
      setError("Failed to improve content.");
    } finally {
      setLoading(false);
    }
  };

  // Get Topic Ideas
  const getTopicIdeas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/ai/topics", { category });
      if (response.data?.success) {
        setTopicIdeas(response.data.data.topics || []);
      }
    } catch (err) {
      setError("Failed to get topic ideas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "topics" && topicIdeas.length === 0) {
      getTopicIdeas();
    }
  }, [activeTab]);

  // Debounced generation effect
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only generate if we have enough title
    if (title.length >= MIN_TITLE_LENGTH) {
      debounceRef.current = setTimeout(() => {
        generateContent();
      }, DEBOUNCE_DELAY);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [title, category, generateContent]);

  // Handle insert content
  const handleInsert = (text) => {
    onInsertContent?.(text);
  };

  // Handle copy to clipboard
  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Check if we have enough title to show suggestions
  const hasEnoughTitle = title.length >= MIN_TITLE_LENGTH;

  // Get paragraph type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "introduction":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "body":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "conclusion":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

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
            AI Content Generator
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
              {/* Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl">
                {[
                  { id: "generate", icon: Sparkles, label: "Ideas" },
                  { id: "grammar", icon: CheckCircle2, label: "Fix" },
                  { id: "improve", icon: Wand2, label: "Polish" },
                  { id: "topics", icon: BrainCircuit, label: "Topics" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Not enough title message */}
              {activeTab === "generate" && !hasEnoughTitle && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium">
                      Enter a title to get AI suggestions
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 mt-1">
                      Add a title (min {MIN_TITLE_LENGTH} characters) and I'll
                      suggest paragraph content to help you get started.
                    </p>
                  </div>
                </div>
              )}

              {/* Error/Info state */}
              {error && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    error.includes("not available") ||
                    error.includes("configure") ||
                    error.includes("No obvious") ||
                    error.includes("No issues")
                      ? "bg-amber-50 dark:bg-amber-900/20"
                      : "bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <AlertCircle
                    className={`w-5 h-5 ${
                      error.includes("not available") ||
                      error.includes("configure") ||
                      error.includes("No issues")
                        ? "text-amber-500"
                        : "text-red-500"
                    }`}
                  />
                  <span
                    className={`text-sm flex-1 ${
                      error.includes("not available") ||
                      error.includes("configure") ||
                      error.includes("No issues")
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {error}
                  </span>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-purple-200 dark:border-purple-900" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI Assistant is working...
                  </p>
                </div>
              )}

              {/* Paragraph suggestions */}
              {activeTab === "generate" &&
                paragraphs.length > 0 &&
                hasEnoughTitle && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Suggested Paragraphs
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {paragraphs.map((paragraph) => (
                        <motion.div
                          key={paragraph.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group relative p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
                        >
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2 capitalize ${getTypeBadgeColor(
                              paragraph.type
                            )}`}
                          >
                            {paragraph.type}
                          </span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {paragraph.text}
                          </p>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handleInsert(paragraph.text)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Insert
                            </button>
                            <button
                              onClick={() =>
                                handleCopy(paragraph.id, paragraph.text)
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                            >
                              {copiedId === paragraph.id ? (
                                <Check className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              {copiedId === paragraph.id ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Grammar Section */}
              {activeTab === "grammar" && (
                <div className="space-y-4">
                  <button
                    onClick={checkGrammar}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Check Grammar
                  </button>

                  {grammarErrors.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Issues Found
                      </p>
                      {grammarErrors.map((err, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-red-600 dark:text-red-400">
                              "{err.text}"
                            </span>
                            <span className="text-[10px] text-red-500 opacity-70">
                              {err.error}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-gray-500">
                              Suggestion:
                            </span>
                            <button
                              onClick={() => handleCopy(`g-${idx}`, err.suggestion)}
                              className="text-xs font-medium text-green-600 dark:text-green-400 hover:underline"
                            >
                              {err.suggestion}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Improve Section */}
              {activeTab === "improve" && (
                <div className="space-y-4">
                  <button
                    onClick={improveContent}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4" />
                    Polish Content
                  </button>

                  {improvedContent && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        "{improvedContent}"
                      </p>
                      <button
                        onClick={() => handleInsert(improvedContent)}
                        className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Try this version
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Topic Ideas Section */}
              {activeTab === "topics" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Ideas for {category}
                    </span>
                    <button
                      onClick={getTopicIdeas}
                      disabled={loading}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-gray-400 ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {topicIdeas.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCopy(`t-${idx}`, topic)}
                        className="w-full text-left p-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all flex items-center justify-between group"
                      >
                        <span>{topic}</span>
                        <Type className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContentGeneratorPanel;
