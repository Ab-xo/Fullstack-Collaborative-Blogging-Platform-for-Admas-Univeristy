/**
 * ============================================================================
 * SMART BLOG POST TEMPLATE
 * ============================================================================
 * Automatically formats and structures blog post content with professional
 * typography, spacing, and visual hierarchy - even if author doesn't format.
 *
 * Features:
 * - Auto-detects paragraphs, quotes, code blocks, lists
 * - Parses markdown syntax to proper HTML
 * - Adds drop caps to first paragraph
 * - Creates visual breaks between sections
 * - Responsive typography scaling
 * - Reading time estimation
 * - Progress indicator
 * - Table of contents generation
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  BookOpen,
  Quote,
  ChevronRight,
  List,
  Hash,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  Share2,
} from "lucide-react";

// ============================================================================
// MARKDOWN TO HTML CONVERTER - Converts markdown syntax to HTML
// ============================================================================
const convertMarkdownToHtml = (content) => {
  if (!content) return "";

  let html = content;

  // First, check if content is already HTML (from rich text editor)
  // If it contains HTML tags, we should be more careful with conversion
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(html);

  // If content has HTML tags, preserve them and only do minimal processing
  if (hasHtmlTags) {
    // For HTML content, just clean it up and return
    // The rich text editor already produces HTML
    // Make sure images are preserved with proper attributes
    html = html.replace(/<img([^>]*)>/gi, (match, attrs) => {
      // Ensure image has proper display styles
      if (!attrs.includes("style=")) {
        return `<img${attrs} style="max-width: 100%; height: auto; display: block;">`;
      }
      return match;
    });
    return html;
  }

  // For plain text/markdown content, convert to HTML

  // Convert markdown headings (## Heading -> <h2>Heading</h2>)
  html = html.replace(/^######\s*(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s*(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s*(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s*(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s*(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s*(.+)$/gm, "<h1>$1</h1>");

  // Convert bold text (**text** or __text__ -> <strong>text</strong>)
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // Convert italic text (*text* or _text_ -> <em>text</em>)
  // Be careful not to match already converted bold
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>");

  // Convert strikethrough (~~text~~ -> <del>text</del>)
  html = html.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  // Convert inline code (`code` -> <code>code</code>)
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Convert code blocks (```language\ncode\n``` -> <pre><code>code</code></pre>)
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre class="language-$1"><code>$2</code></pre>'
  );

  // Convert blockquotes (> text -> <blockquote>text</blockquote>)
  html = html.replace(/^>\s*(.+)$/gm, "<blockquote>$1</blockquote>");
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, "\n");

  // Convert unordered lists (- item or * item)
  html = html.replace(/^[\-\*]\s+(.+)$/gm, "<li>$1</li>");
  // Wrap consecutive <li> in <ul>
  html = html.replace(
    /(<li>[\s\S]*?<\/li>)(\n<li>[\s\S]*?<\/li>)*/g,
    (match) => {
      return "<ul>" + match + "</ul>";
    }
  );

  // Convert ordered lists (1. item)
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<oli>$1</oli>");
  // Wrap consecutive <oli> in <ol> and convert to <li>
  html = html.replace(
    /(<oli>[\s\S]*?<\/oli>)(\n<oli>[\s\S]*?<\/oli>)*/g,
    (match) => {
      return (
        "<ol>" +
        match.replace(/<\/?oli>/g, (m) => m.replace("oli", "li")) +
        "</ol>"
      );
    }
  );
  html = html.replace(/<\/?oli>/g, (m) => m.replace("oli", "li"));

  // Convert horizontal rules (--- or *** or ___)
  html = html.replace(/^[\-\*_]{3,}$/gm, "<hr>");

  // Convert links ([text](url) -> <a href="url">text</a>)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Convert images (![alt](url) -> <img src="url" alt="alt">)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="rounded-lg max-w-full h-auto" style="max-width: 100%; height: auto; display: block;">'
  );

  // Convert line breaks (double newline -> paragraph break)
  // Split by double newlines and wrap in paragraphs
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map((p) => {
      p = p.trim();
      if (!p) return "";
      // Don't wrap if already wrapped in block elements
      if (
        p.startsWith("<h") ||
        p.startsWith("<ul") ||
        p.startsWith("<ol") ||
        p.startsWith("<blockquote") ||
        p.startsWith("<pre") ||
        p.startsWith("<hr") ||
        p.startsWith("<p") ||
        p.startsWith("<div") ||
        p.startsWith("<table") ||
        p.startsWith("<img")
      ) {
        return p;
      }
      return `<p>${p}</p>`;
    })
    .join("\n");

  // Convert single line breaks within paragraphs to <br>
  html = html.replace(/([^>\n])\n([^<\n])/g, "$1<br>$2");

  // Clean up any emoji markers that might be in headings (like ## 🔴 Title)
  // Keep the emoji but ensure proper spacing
  html = html.replace(/<h(\d)>([^<]*)<\/h\1>/g, (match, level, content) => {
    // Clean up the content - remove extra spaces around emojis
    const cleanContent = content.trim();
    return `<h${level}>${cleanContent}</h${level}>`;
  });

  return html;
};

// ============================================================================
// CONTENT SANITIZER - Removes unwanted wrapper links from content
// ============================================================================
const sanitizeContent = (htmlContent) => {
  if (!htmlContent) return "";

  // Create a temporary div to parse and clean HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  // Remove any anchor tags that wrap entire block elements (headings, paragraphs)
  // This fixes the issue where content appears as links
  const blockElements = tempDiv.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, p, div"
  );
  blockElements.forEach((el) => {
    // Check if the element is wrapped in an anchor or contains only an anchor
    if (el.children.length === 1 && el.children[0].tagName === "A") {
      const anchor = el.children[0];
      // If the anchor doesn't have a real href (or href is just #), unwrap it
      const href = anchor.getAttribute("href");
      if (!href || href === "#" || href.startsWith("#heading-")) {
        el.innerHTML = anchor.innerHTML;
      }
    }
    // Also check if parent is an anchor
    if (el.parentElement && el.parentElement.tagName === "A") {
      const anchor = el.parentElement;
      const href = anchor.getAttribute("href");
      if (!href || href === "#" || href.startsWith("#heading-")) {
        anchor.replaceWith(el);
      }
    }
  });

  return tempDiv.innerHTML;
};

// ============================================================================
// CONTENT PARSER - Intelligently parses and structures content
// ============================================================================
const parseContent = (htmlContent) => {
  if (!htmlContent) return { sections: [], toc: [], readingTime: 0 };

  // First, sanitize the content to remove unwanted wrapper links
  const sanitizedContent = sanitizeContent(htmlContent);

  // Then, convert any markdown syntax to HTML
  const convertedContent = convertMarkdownToHtml(sanitizedContent);

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = convertedContent;

  const sections = [];
  const toc = [];
  let wordCount = 0;

  // Process all child nodes
  const processNode = (node, index) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        wordCount += text.split(/\s+/).length;
        return { type: "text", content: text, index };
      }
      return null;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const tagName = node.tagName.toLowerCase();
    const text = node.textContent.trim();
    wordCount += text.split(/\s+/).length;

    // Headings
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
      const level = parseInt(tagName[1]);
      const id = `heading-${index}-${text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .slice(0, 30)}`;
      toc.push({ level, text, id });
      return { type: "heading", level, content: text, id, index };
    }

    // Paragraphs
    if (tagName === "p") {
      const innerHTML = node.innerHTML;
      // Check if it's a quote (starts with " or contains blockquote-like content)
      if (
        text.startsWith('"') ||
        text.startsWith("'") ||
        text.startsWith("\u201C")
      ) {
        return { type: "quote", content: innerHTML, index };
      }
      return { type: "paragraph", content: innerHTML, index };
    }

    // Blockquotes
    if (tagName === "blockquote") {
      return { type: "blockquote", content: node.innerHTML, index };
    }

    // Code blocks
    if (tagName === "pre" || tagName === "code") {
      const code = node.textContent;
      const language = node.className?.match(/language-(\w+)/)?.[1] || "text";
      return { type: "code", content: code, language, index };
    }

    // Lists
    if (tagName === "ul" || tagName === "ol") {
      const items = Array.from(node.querySelectorAll("li")).map(
        (li) => li.innerHTML
      );
      return {
        type: tagName === "ul" ? "unordered-list" : "ordered-list",
        items,
        index,
      };
    }

    // Images
    if (tagName === "img") {
      return {
        type: "image",
        src: node.src,
        alt: node.alt || "",
        caption: node.title || "",
        index,
      };
    }

    // Figure (image with caption)
    if (tagName === "figure") {
      const img = node.querySelector("img");
      const caption = node.querySelector("figcaption");
      if (img) {
        return {
          type: "image",
          src: img.src,
          alt: img.alt || "",
          caption: caption?.textContent || "",
          index,
        };
      }
    }

    // Tables
    if (tagName === "table") {
      return { type: "table", content: node.outerHTML, index };
    }

    // Dividers
    if (tagName === "hr") {
      return { type: "divider", index };
    }

    // Default: wrap in paragraph
    if (text) {
      return { type: "paragraph", content: node.innerHTML || text, index };
    }

    return null;
  };

  // Process all children
  Array.from(tempDiv.childNodes).forEach((node, index) => {
    const section = processNode(node, index);
    if (section) sections.push(section);
  });

  // Calculate reading time (average 200 words per minute)
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return { sections, toc, readingTime, wordCount };
};

// ============================================================================
// SECTION RENDERERS - Beautiful rendering for each content type
// ============================================================================

// Drop Cap Paragraph (for first paragraph)
const DropCapParagraph = ({ content }) => (
  <p
    className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-green-600 dark:first-letter:text-green-400 first-letter:leading-none"
    dangerouslySetInnerHTML={{ __html: content }}
  />
);

// Regular Paragraph
const Paragraph = ({ content, isFirst = false }) => {
  if (isFirst) return <DropCapParagraph content={content} />;

  return (
    <p
      className="text-lg leading-relaxed text-gray-700 dark:text-gray-300"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

// Heading Component
const Heading = ({ level, content, id }) => {
  const Tag = `h${level}`;
  const styles = {
    1: "text-4xl font-bold mt-12 mb-6",
    2: "text-3xl font-bold mt-10 mb-5 pb-3 border-b border-gray-200 dark:border-gray-700",
    3: "text-2xl font-semibold mt-8 mb-4",
    4: "text-xl font-semibold mt-6 mb-3",
    5: "text-lg font-semibold mt-4 mb-2",
    6: "text-base font-semibold mt-4 mb-2",
  };

  return (
    <Tag
      id={id}
      className={`${styles[level]} text-gray-900 dark:text-white scroll-mt-24`}
    >
      {content}
    </Tag>
  );
};

// Blockquote Component
const BlockquoteSection = ({ content }) => (
  <blockquote className="relative my-8 pl-6 py-4 border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent rounded-r-xl">
    <Quote className="absolute -left-3 -top-3 w-8 h-8 text-green-500 bg-white dark:bg-gray-800 rounded-full p-1" />
    <div
      className="text-lg italic text-gray-700 dark:text-gray-300 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  </blockquote>
);

// Code Block Component
const CodeBlock = ({ content, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-xl overflow-hidden bg-gray-900 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
          {content}
        </code>
      </pre>
    </div>
  );
};

// List Component
const ListSection = ({ type, items }) => {
  const ListTag = type === "ordered-list" ? "ol" : "ul";
  const listStyle = type === "ordered-list" ? "list-decimal" : "list-disc";

  return (
    <ListTag className={`my-6 pl-6 space-y-2 ${listStyle}`}>
      {items.map((item, index) => (
        <li
          key={index}
          className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: item }}
        />
      ))}
    </ListTag>
  );
};

// Image Component
const ImageSection = ({ src, alt, caption }) => (
  <figure className="my-8">
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </div>
    {caption && (
      <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400 italic">
        {caption}
      </figcaption>
    )}
  </figure>
);

// Divider Component
const Divider = () => (
  <div className="my-12 flex items-center justify-center gap-4">
    <div className="w-16 h-px bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-600" />
    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
    <div className="w-2 h-2 rounded-full bg-green-500" />
    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
    <div className="w-16 h-px bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-600" />
  </div>
);

// Table Component
const TableSection = ({ content }) => (
  <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
    <div
      className="prose prose-table:w-full prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-td:border-gray-200 dark:prose-td:border-gray-700"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  </div>
);

// ============================================================================
// TABLE OF CONTENTS COMPONENT
// ============================================================================
const TableOfContents = ({ toc, activeId }) => {
  if (!toc || toc.length < 2) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden xl:block fixed right-8 top-1/3 w-64 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <List className="w-4 h-4" />
        Table of Contents
      </h4>
      <ul className="space-y-2">
        {toc.map((item, index) => (
          <li key={index} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
            <a
              href={`#${item.id}`}
              className={`text-sm block py-1 transition-colors ${
                activeId === item.id
                  ? "text-green-600 dark:text-green-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`}
            >
              {item.text.length > 40
                ? item.text.slice(0, 40) + "..."
                : item.text}
            </a>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
};

// ============================================================================
// READING PROGRESS BAR
// ============================================================================
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-50">
      <motion.div
        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
        style={{ width: `${progress}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};

// ============================================================================
// POST META INFO BAR
// ============================================================================
const PostMetaBar = ({
  readingTime,
  wordCount,
  onBookmark,
  onShare,
  isBookmarked,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-6 mb-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">{readingTime} min read</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <BookOpen className="w-4 h-4" />
        <span className="text-sm font-medium">
          {wordCount?.toLocaleString()} words
        </span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBookmark}
        className={`p-2 rounded-lg transition-colors ${
          isBookmarked
            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
      >
        <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onShare}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <Share2 className="w-5 h-5" />
      </motion.button>
    </div>
  </div>
);

// ============================================================================
// MAIN POST TEMPLATE COMPONENT
// ============================================================================
const PostTemplate = ({
  content,
  showProgress = true,
  showToc = true,
  showMeta = true,
  onShare,
  onBookmark,
  isBookmarked = false,
}) => {
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const contentRef = useRef(null);

  // Generate consistent ID from text
  const generateHeadingId = (text, index) => {
    // Strip HTML tags and normalize text
    const cleanText = text.replace(/<[^>]*>/g, "").trim();
    return `heading-${index}-${cleanText
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special chars except spaces and hyphens
      .replace(/\s+/g, "-")
      .slice(0, 30)}`;
  };

  // Prepare the HTML content for direct rendering
  const { preparedContent, tocItems } = useMemo(() => {
    if (!content) return { preparedContent: "", tocItems: [] };

    // Sanitize and convert markdown
    let html = sanitizeContent(content);
    html = convertMarkdownToHtml(html);

    const tocItems = [];
    let headingIndex = 0;

    // Add IDs to headings for TOC navigation - handle headings with HTML content
    html = html.replace(
      /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
      (match, level, attrs, innerContent) => {
        // Get clean text for ID generation
        const cleanText = innerContent.replace(/<[^>]*>/g, "").trim();
        const id = generateHeadingId(cleanText, headingIndex);

        // Add to TOC
        tocItems.push({
          level: parseInt(level),
          text: cleanText,
          id: id,
        });

        headingIndex++;

        // Check if id already exists in attrs
        if (attrs.includes("id=")) {
          return match;
        }

        return `<h${level}${attrs} id="${id}" class="scroll-mt-24">${innerContent}</h${level}>`;
      }
    );

    return { preparedContent: html, tocItems };
  }, [content]);

  // Calculate reading time and word count
  const { readingTime, wordCount } = useMemo(() => {
    if (!content) return { readingTime: 1, wordCount: 0 };
    const text = content.replace(/<[^>]*>/g, "");
    const words = text.split(/\s+/).filter((w) => w.length > 0).length;
    return {
      readingTime: Math.max(1, Math.ceil(words / 200)),
      wordCount: words,
    };
  }, [content]);

  // Track active heading for TOC with smooth scroll
  useEffect(() => {
    if (!showToc || tocItems.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    // Wait for content to render, then observe headings
    const timer = setTimeout(() => {
      tocItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.observe(element);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [tocItems, showToc]);

  // Handle TOC click with smooth scroll
  const handleTocClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update URL hash without jumping
      window.history.pushState(null, "", `#${id}`);
      setActiveHeadingId(id);
    }
  };

  return (
    <>
      {/* Reading Progress Bar */}
      {showProgress && <ReadingProgress />}

      {/* Table of Contents */}
      {showToc && tocItems.length >= 2 && (
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden xl:block fixed right-8 top-1/3 w-64 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-40"
        >
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <List className="w-4 h-4" />
            Table of Contents
          </h4>
          <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
            {tocItems.map((item, index) => (
              <li
                key={index}
                style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleTocClick(e, item.id)}
                  className={`text-sm block py-1 transition-colors cursor-pointer ${
                    activeHeadingId === item.id
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                  }`}
                >
                  {item.text.length > 40
                    ? item.text.slice(0, 40) + "..."
                    : item.text}
                </a>
              </li>
            ))}
          </ul>
        </motion.nav>
      )}

      {/* Post Meta Bar */}
      {showMeta && (
        <PostMetaBar
          readingTime={readingTime}
          wordCount={wordCount}
          onShare={onShare}
          onBookmark={onBookmark}
          isBookmarked={isBookmarked}
        />
      )}

      {/* Main Content - Rendered directly with CSS styling */}
      <article
        ref={contentRef}
        className="post-content prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24"
        dangerouslySetInnerHTML={{ __html: preparedContent }}
      />

      {/* End of Article Marker */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
          <span className="text-sm font-medium">End of Article</span>
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
        </div>
      </div>
    </>
  );
};

export default PostTemplate;

// Export individual components for custom use
export {
  parseContent,
  convertMarkdownToHtml,
  sanitizeContent,
  DropCapParagraph,
  Paragraph,
  Heading,
  BlockquoteSection,
  CodeBlock,
  ListSection,
  ImageSection,
  Divider,
  TableSection,
  TableOfContents,
  ReadingProgress,
  PostMetaBar,
};
