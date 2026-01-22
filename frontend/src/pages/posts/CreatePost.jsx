/**
 * ============================================================================
 * CREATE POST PAGE
 * ============================================================================
 *
 * Page for creating new blog posts on the platform.
 *
 * FORM FIELDS:
 *   - Title (required)
 *   - Category (required, dropdown selection)
 *   - Featured Image (optional, upload or URL)
 *   - Content (required, rich text editor)
 *   - Excerpt (optional, auto-generated if empty)
 *   - Tags (optional)
 *
 * FEATURES:
 *   - Rich text editor with formatting options
 *   - Image upload via drag-and-drop or file picker
 *   - Image URL input option
 *   - Save as draft functionality
 *   - Submit for review (pending approval)
 *   - Preview before publishing
 *
 * WORKFLOW:
 *   1. User fills in post details
 *   2. User can save as draft or submit for review
 *   3. Submitted posts go to moderator queue
 *   4. Approved posts are published
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { postsAPI } from "../../api/posts";
import { useAuth } from "../../hooks/useAuth";
import {
  Save,
  Send,
  Image as ImageIcon,
  ArrowLeft,
  Eye,
  FileText,
  Upload,
  Link as LinkIcon,
  X,
  ShieldAlert,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import RichTextEditor from "../../components/common/RichTextEditor";
import ContentGeneratorPanel from "../../components/ai/ContentGeneratorPanel";
import { ContentGuidelinesPanel } from "../../components/terms";
import toast from "react-hot-toast";

/**
 * All available blog categories
 * Must match backend BlogPost schema categories
 */
const CATEGORIES = [
  // Academic & Research
  "academic",
  "research",
  "thesis",
  "tutorials",
  // Campus Life
  "campus-life",
  "events",
  "clubs",
  "sports",
  // Technology & Innovation
  "technology",
  "innovation",
  "engineering",
  "science",
  // Arts & Culture
  "culture",
  "arts",
  "literature",
  // Career & Community
  "career",
  "alumni",
  "opinion",
  "announcements",
  "news",
  // Additional Categories
  "general",
  "computer-science",
  "business",
  "medicine",
  "law",
  "education",
  "mathematics",
  "social-sciences",
  "other",
];

const CreatePost = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [guidelinesAcknowledged, setGuidelinesAcknowledged] = useState(false);
  const fileInputRef = useRef(null);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Check if user has author permissions
  const userRoles = user?.roles || [user?.role] || [];
  const canCreatePosts = userRoles.some((role) =>
    ["admin", "moderator", "author"].includes(role),
  );

  // Redirect readers who shouldn't be able to create posts
  useEffect(() => {
    if (user && !canCreatePosts) {
      // User is logged in but doesn't have author permissions
      // We'll show a message instead of redirecting
    }
  }, [user, canCreatePosts]);

  // Show access denied message for readers
  if (user && !canCreatePosts) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Author Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need an Author account to create blog posts. Your current
            account type is{" "}
            <strong className="text-gray-900 dark:text-white">Reader</strong>.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            As a Reader, you can browse posts, like, comment, and follow
            authors. If you'd like to write and publish content, please contact
            an administrator to upgrade your account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button variant="primary" onClick={() => navigate("/")}>
              Browse Posts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data, status = "draft") => {
    try {
      setLoading(true);

      // Validate content length (strip HTML tags)
      const textContent = data.content
        ? data.content.replace(/<[^>]*>/g, "").trim()
        : "";
      if (textContent.length < 50) {
        toast.error(
          "Content must be at least 50 characters long (excluding formatting)",
        );
        setLoading(false);
        return;
      }

      // Validate category is selected
      if (!data.category) {
        toast.error("Please select a category");
        setLoading(false);
        return;
      }

      const postData = {
        title: data.title?.trim(),
        content: data.content,
        category: data.category,
        status,
        excerpt: data.excerpt?.trim() || "",
        metaDescription: data.metaDescription?.trim() || "",
        // Use imagePreview as fallback if featuredImage is not in form data
        featuredImage: data.featuredImage || imagePreview || "",
        tags: data.tags
          ? data.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      };

      // Remove featuredImage if it's empty to avoid validation error
      if (!postData.featuredImage || postData.featuredImage.trim() === "") {
        delete postData.featuredImage;
      }

      // Remove empty optional fields
      if (!postData.excerpt) delete postData.excerpt;
      if (!postData.metaDescription) delete postData.metaDescription;
      if (postData.tags.length === 0) delete postData.tags;

      console.log("Submitting post data:", postData);

      const response = await postsAPI.createPost(postData);

      // Check if post was flagged for violations
      if (response.violationReport?.hasViolations) {
        toast.success(
          `Post submitted for review. Note: ${response.violationReport.violationCount} potential violation(s) detected - moderators will review.`,
          { duration: 5000 },
        );
      } else {
        toast.success(
          status === "draft"
            ? "Draft saved successfully!"
            : "Post submitted for review!",
        );
      }
      navigate("/my-posts");
    } catch (error) {
      console.error("Error creating post:", error);

      // Handle moderation rejection (critical violations)
      if (error.response?.data?.moderation) {
        const { flags, severity, recommendation } =
          error.response.data.moderation;
        toast.error(
          `Content flagged: ${error.response.data.message}. Severity: ${severity}`,
          { duration: 6000 },
        );
        return;
      }

      // Handle validation errors array from backend
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const errorMessages = error.response.data.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join("\n");
        toast.error(errorMessages || "Validation failed", { duration: 5000 });
        return;
      }

      // Show specific validation errors
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create post. Please check all required fields.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileSelect = async (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    try {
      toast.loading("Uploading image...", { id: "upload" });
      const response = await postsAPI.uploadFeaturedImage(file);

      if (response.success && response.data.url) {
        setImagePreview(response.data.url);
        // Update form value with Cloudinary URL using setValue
        setValue("featuredImage", response.data.url);
        toast.success("Image uploaded successfully!", { id: "upload" });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.", {
        id: "upload",
      });
      setImagePreview("");
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle image URL input - supports any image URL including "Copy image address" from Chrome
  const handleImageUrl = () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter a valid image URL");
      return;
    }

    // Clean the URL - remove any whitespace
    let finalUrl = imageUrl.trim();

    // Check if URL is valid
    try {
      new URL(finalUrl);
    } catch (error) {
      toast.error("Please enter a valid URL");
      return;
    }

    // For Unsplash URLs, convert to direct image URL
    if (finalUrl.includes("unsplash.com/photos/")) {
      const photoId = finalUrl.split("/photos/")[1]?.split("?")[0];
      if (photoId) {
        finalUrl = `https://images.unsplash.com/photo-${photoId}?w=1200&h=600&fit=crop`;
        toast.info("Converting Unsplash URL to direct image link...");
      }
    }

    // Show loading state
    toast.loading("Loading image...", { id: "image-url-load" });

    // Always try to load the image - this handles:
    // - Direct image URLs (.jpg, .png, etc.)
    // - URLs without extensions (like Google Images, CDN URLs)
    // - URLs with query parameters
    // - "Copy image address" URLs from any browser
    const img = new Image();

    // Set crossOrigin to handle CORS for some images
    img.crossOrigin = "anonymous";

    img.onload = () => {
      setImagePreview(finalUrl);
      // Update form value using setValue
      setValue("featuredImage", finalUrl);
      setShowUrlInput(false);
      setImageUrl("");
      toast.success("Image loaded successfully!", { id: "image-url-load" });
    };

    img.onerror = () => {
      // Try again without crossOrigin (some servers don't support CORS but images still work)
      const img2 = new Image();
      img2.onload = () => {
        setImagePreview(finalUrl);
        // Update form value using setValue
        setValue("featuredImage", finalUrl);
        setShowUrlInput(false);
        setImageUrl("");
        toast.success("Image loaded successfully!", { id: "image-url-load" });
      };
      img2.onerror = () => {
        // Even if we can't verify the image loads, accept the URL
        // Some images are blocked by CORS but will still work when rendered
        toast.dismiss("image-url-load");

        // Check if it looks like an image URL
        const looksLikeImage =
          /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff?|avif)(\?|$)/i.test(
            finalUrl,
          ) ||
          finalUrl.includes("/image") ||
          finalUrl.includes("img") ||
          finalUrl.includes("photo") ||
          finalUrl.includes("picture") ||
          finalUrl.includes("media") ||
          finalUrl.includes("cdn") ||
          finalUrl.includes("cloudinary") ||
          finalUrl.includes("imgur") ||
          finalUrl.includes("unsplash") ||
          finalUrl.includes("pexels") ||
          finalUrl.includes("googleusercontent");

        if (looksLikeImage) {
          setImagePreview(finalUrl);
          setValue("featuredImage", finalUrl);
          setShowUrlInput(false);
          setImageUrl("");
          toast.success(
            "Image URL accepted! Preview may not show due to CORS, but it should work when published.",
            { duration: 4000 },
          );
        } else {
          toast.error(
            "Could not load image. Please check the URL is a direct image link.",
            { id: "image-url-load" },
          );
        }
      };
      img2.src = finalUrl;
    };

    img.src = finalUrl;
  };

  const clearImage = () => {
    setImagePreview("");
    setImageUrl("");
    setValue("featuredImage", "");
  };

  const contentLength = watch("content")?.length || 0;
  const watchedTitle = watch("title") || "";
  const watchedContent = watch("content") || "";
  const watchedCategory = watch("category") || "general";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                icon={ArrowLeft}
                onClick={() => navigate(-1)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Back
              </Button>
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Create New Post
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Share your story with the Admas University community
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Post Details</span>
              <span>Content</span>
              <span>Review</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: "33%" }}
              ></div>
            </div>
          </div>

          {/* Content Guidelines Panel */}
          <div className="mb-6">
            <ContentGuidelinesPanel
              acknowledged={guidelinesAcknowledged}
              onAcknowledge={() => setGuidelinesAcknowledged(true)}
              showAcknowledgment={true}
              defaultExpanded={false}
            />
          </div>

          <Card className="p-8 border-0 shadow-xl dark:shadow-2xl dark:shadow-gray-900/30">
            <form
              onSubmit={handleSubmit((data) => onSubmit(data, "pending"))}
              className="space-y-8"
            >
              {/* Title Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Post Information
                  </h2>
                </div>

                <Input
                  label="Title"
                  placeholder="Craft an engaging title that captures attention..."
                  required
                  error={errors.title?.message}
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 5,
                      message: "Title must be at least 5 characters",
                    },
                    maxLength: {
                      value: 200,
                      message: "Title cannot exceed 200 characters",
                    },
                  })}
                />
              </div>

              {/* Category and Tags Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("category", {
                      required: "Category is required",
                    })}
                    className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() +
                          cat.slice(1).replace("-", " ")}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <Input
                  label="Tags"
                  placeholder="technology, innovation, research..."
                  helperText="Comma-separated tags (max 10)"
                  {...register("tags")}
                />
              </div>

              {/* Featured Image */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Featured Image
                    </h3>
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Image
                    </button>
                  )}
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Featured Image Preview"
                      className="w-full h-80 object-cover rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-2xl"
                      onError={() => {
                        setImagePreview("");
                        toast.error("Failed to load image");
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-2xl"></div>
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Featured Image Preview
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        This image will appear at the top of your post
                      </p>
                    </div>
                  </div>
                )}

                {/* Drag and Drop Area */}
                {!imagePreview && (
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                    <Upload
                      className={`w-16 h-16 mx-auto mb-4 transition-all duration-300 ${
                        isDragging
                          ? "text-blue-500 scale-110"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isDragging
                        ? "Drop your image here"
                        : "Drag and drop your featured image"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      or click to browse (Max 5MB, JPG, PNG, GIF, WebP)
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <ImageIcon className="w-4 h-4" />
                      <span>Recommended: 1200x600px for best results</span>
                    </div>
                  </div>
                )}

                {/* URL Input Option */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>{showUrlInput ? "Hide" : "Use"} Image URL</span>
                  </button>

                  {showUrlInput && (
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg or Unsplash URL"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all duration-200"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleImageUrl();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleImageUrl}
                        className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-200 transform hover:scale-105"
                      >
                        Load Image from URL
                      </button>
                      <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <svg
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <p className="font-medium mb-1">💡 Pro Tips:</p>
                          <ul className="space-y-1 list-disc list-inside">
                            <li>
                              For Unsplash: Paste the photo page URL (e.g.,
                              unsplash.com/photos/abc123)
                            </li>
                            <li>
                              Use high-quality images (1200x600px recommended)
                            </li>
                            <li>Ensure the URL is publicly accessible</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden input for form */}
                <input type="hidden" {...register("featuredImage")} />
              </div>

              {/* Excerpt */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Excerpt
                </label>
                <textarea
                  {...register("excerpt", {
                    maxLength: {
                      value: 300,
                      message: "Excerpt cannot exceed 300 characters",
                    },
                  })}
                  rows={3}
                  placeholder="Write a compelling summary that will appear in post previews and search results..."
                  className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {watch("excerpt")?.length || 0}/300 characters
                  </p>
                  {errors.excerpt && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.excerpt.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Content Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Content
                    </h2>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      contentLength >= 50
                        ? "text-green-600 dark:text-green-400"
                        : "text-orange-600 dark:text-orange-400"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>
                      {contentLength} characters
                      {contentLength < 50 && ` (minimum 50 required)`}
                      {contentLength >= 50 && ` ✓`}
                    </span>
                  </div>
                </div>

                <Controller
                  name="content"
                  control={control}
                  rules={{
                    required: "Content is required",
                    minLength: {
                      value: 50,
                      message: "Content must be at least 50 characters",
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Start writing your amazing content... Use the toolbar above to format your text, add images, and create engaging layouts!"
                      error={errors.content?.message}
                      minHeight="500px"
                    />
                  )}
                />
              </div>

              {/* SEO Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Meta Description (SEO)
                </label>
                <textarea
                  {...register("metaDescription", {
                    maxLength: {
                      value: 160,
                      message: "Meta description cannot exceed 160 characters",
                    },
                  })}
                  rows={2}
                  placeholder="Optimize for search engines with a compelling meta description..."
                  className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {watch("metaDescription")?.length || 0}/160 characters
                  </p>
                  {errors.metaDescription && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.metaDescription.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="secondary"
                  icon={Save}
                  loading={loading}
                  onClick={handleSubmit((data) => onSubmit(data, "draft"))}
                  disabled={!isDirty}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl transition-all duration-200"
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={Send}
                  loading={loading}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  Submit for Review
                </Button>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Your post will be reviewed by moderators before being
                  published to ensure quality content for our community.
                </p>
              </div>
            </form>
          </Card>
        </div>

        {/* AI Content Generator Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <ContentGeneratorPanel
              title={watchedTitle}
              category={watchedCategory}
              content={watchedContent}
              isCollapsed={!showAISuggestions}
              onToggleCollapse={(collapsed) => setShowAISuggestions(!collapsed)}
              onInsertContent={(text) => {
                // Get current content and append the new paragraph
                const currentContent = watchedContent || "";
                const newContent = currentContent
                  ? `${currentContent}\n\n${text}`
                  : text;
                setValue("content", newContent);
                toast.success("Content inserted!");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
