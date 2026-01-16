/**
 * ============================================================================
 * EDIT POST PAGE - BLOG POST EDITING
 * ============================================================================
 *
 * Purpose:
 *   Allows authors to edit their existing blog posts, including
 *   content, images, categories, and publication status.
 *
 * Features:
 *   - Rich text editor for content editing
 *   - Featured image upload (file or URL)
 *   - Category selection from predefined list
 *   - Save as draft or submit for review
 *   - Form validation with react-hook-form
 *   - Auto-load existing post data
 *   - Image preview functionality
 *
 * Access Control:
 *   - Only post author can edit their posts
 *   - Admins/Moderators can edit any post
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { postsAPI } from "../../api/posts";
import {
  Save,
  Send,
  Image as ImageIcon,
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  X,
  Users,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import RichTextEditor from "../../components/common/RichTextEditor";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ContentGeneratorPanel from "../../components/ai/ContentGeneratorPanel";
import { CollaboratorManager, ReviewPanel } from "../../components/collaboration";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../contexts/SocketContext";
import toast from "react-hot-toast";

const CATEGORIES = [
  "academic",
  "research",
  "campus-life",
  "events",
  "technology",
  "innovation",
  "sports",
  "culture",
  "opinion",
  "other",
];

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [postAuthorId, setPostAuthorId] = useState(null);
  const fileInputRef = useRef(null);

  // Collaboration State
  const { socket, isConnected } = useSocket();
  const [activeEditors, setActiveEditors] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getPost(id);
      const post = response.post;

      // Populate form with existing data
      setValue("title", post.title);
      setValue("category", post.category);
      setValue("featuredImage", post.featuredImage);
      setValue("excerpt", post.excerpt);
      setValue("content", post.content);
      setValue("tags", post.tags?.join(", ") || "");
      setValue("status", post.status);

      setImagePreview(post.featuredImage);
      setPostAuthorId(post.author?._id || post.author);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post");
      navigate("/my-posts");
    } finally {
      setLoading(false);
    }
  };

  // Socket Collaboration Logic
  useEffect(() => {
    if (!socket || !isConnected || !id) return;

    // Join the editing room
    socket.emit("join:edit", { postId: id });

    // Listen for presence updates
    socket.on("presence:list", ({ users }) => {
      setActiveEditors(users.filter((u) => u.id !== user?._id));
    });

    socket.on("presence:join", ({ user: newUser }) => {
      if (newUser.id !== user?._id) {
        setActiveEditors((prev) => {
          if (prev.find((u) => u.id === newUser.id)) return prev;
          return [...prev, newUser];
        });
        toast.success(`${newUser.firstName} joined the editing session`);
      }
    });

    socket.on("presence:leave", ({ userId }) => {
      setActiveEditors((prev) => prev.filter((u) => u.id !== userId));
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    // Listen for typing indicators
    socket.on("typing:user", ({ user: typingUser, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [typingUser.id]: isTyping ? typingUser.firstName : null,
      }));
    });

    return () => {
      socket.emit("leave:edit", { postId: id });
      socket.off("presence:list");
      socket.off("presence:join");
      socket.off("presence:leave");
      socket.off("typing:user");
    };
  }, [socket, isConnected, id, user?._id]);

  const onSubmit = async (data, statusOverride = null) => {
    try {
      setSaving(true);

      // Validate content length
      if (!data.content || data.content.trim().length < 50) {
        toast.error("Content must be at least 50 characters long");
        setSaving(false);
        return;
      }

      const postData = {
        ...data,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      };

      // Only include status if explicitly provided (for draft/pending changes)
      // Don't change status when just updating content
      if (statusOverride) {
        postData.status = statusOverride;
      } else {
        // Remove status from update to keep current status
        delete postData.status;
      }

      // Remove featuredImage if it's empty to avoid validation error
      if (!postData.featuredImage || postData.featuredImage.trim() === "") {
        delete postData.featuredImage;
      }

      await postsAPI.updatePost(id, postData);

      toast.success("Post updated successfully!");
      navigate(`/posts/${id}`);
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(error.response?.data?.message || "Failed to update post");
    } finally {
      setSaving(false);
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
            finalUrl
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
            { duration: 4000 }
          );
        } else {
          toast.error(
            "Could not load image. Please check the URL is a direct image link.",
            { id: "image-url-load" }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading post..." />
      </div>
    );
  }

  const contentLength = watch("content")?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Post
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-600 dark:text-gray-400">
                Update your post content
              </p>
              {activeEditors.length > 0 && (
                <div className="flex items-center -space-x-2 ml-4">
                  {activeEditors.map((editor) => (
                    <div
                      key={editor.id}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-500/20"
                      title={`${editor.firstName} is also editing`}
                    >
                      {editor.avatar ? (
                        <img
                          src={editor.avatar}
                          alt={editor.firstName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        editor.firstName.charAt(0)
                      )}
                    </div>
                  ))}
                  <span className="ml-3 text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                    {activeEditors.length === 1
                      ? "1 other person is editing"
                      : `${activeEditors.length} others are editing`}
                  </span>
                </div>
              )}
            </div>
            {Object.values(typingUsers).filter(Boolean).length > 0 && (
              <p className="text-xs text-gray-400 mt-1 italic">
                {Object.values(typingUsers).filter(Boolean).join(", ")} is
                typing...
              </p>
            )}
          </div>
        </div>
      </div>

      <Card className="p-8 border-0 shadow-xl dark:shadow-2xl dark:shadow-gray-900/30">
        <form
          onSubmit={handleSubmit((data) => onSubmit(data))}
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
              placeholder="Enter post title..."
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
                {...register("category", { required: "Category is required" })}
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
                    onKeyDown={(e) => {
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
                  placeholder="Start writing your amazing content..."
                  error={errors.content?.message}
                  minHeight="500px"
                  postId={id}
                  socket={socket}
                  isConnected={isConnected}
                />
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              icon={Save}
              loading={saving}
              onClick={handleSubmit((data) => onSubmit(data, "draft"))}
              className="flex-1 sm:flex-none px-8 py-3 rounded-xl transition-all duration-200"
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Send}
              loading={saving}
              className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Update Post
            </Button>
          </div>
        </form>
      </Card>

      {/* Collaboration and Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Collaborators
            </h2>
          </div>
          <CollaboratorManager
            postId={id}
            isAuthor={postAuthorId === user?._id}
          />
        </div>

        <div>
          <ReviewPanel
            postId={id}
            isAuthor={postAuthorId === user?._id}
            currentStatus={watch("status")}
            onStatusUpdate={(newStatus) => setValue("status", newStatus)}
          />
        </div>
      </div>

      {/* AI Content Generator Sidebar */}
      <div className="fixed top-24 right-8 w-80 hidden xl:block">
        <ContentGeneratorPanel
          title={watch("title")}
          category={watch("category") || "general"}
          content={watch("content")}
          onInsertContent={(text) => {
            const currentContent = watch("content") || "";
            const newContent = currentContent
              ? `${currentContent}\n\n${text}`
              : text;
            setValue("content", newContent);
            toast.success("Content inserted!");
          }}
        />
      </div>
    </div>
  );
};

export default EditPost;
