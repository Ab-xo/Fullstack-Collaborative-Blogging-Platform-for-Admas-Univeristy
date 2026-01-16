/**
 * ============================================================================
 * EDIT PROFILE PAGE - USER PROFILE MANAGEMENT
 * ============================================================================
 *
 * Purpose:
 *   Allows authenticated users to update their profile information,
 *   including personal details, avatar, bio, and social media links.
 *
 * Features:
 *   - Profile picture upload (file or URL)
 *   - Personal information editing (name, email, phone)
 *   - Bio/description update
 *   - Social media links management (Twitter, LinkedIn, GitHub, Website)
 *   - Form validation with react-hook-form
 *   - Real-time image preview
 *   - Animated UI with Framer Motion
 *
 * Dependencies:
 *   - useAuth hook for user data and update functions
 *   - apiClient for profile image upload
 *   - react-hook-form for form management
 *   - Framer Motion for animations
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Camera,
  Mail,
  Save,
  ArrowLeft,
  Trash2,
  Phone,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../api/client";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("username", user.username || "");
      setValue("bio", user.profile?.bio || "");
      setValue("phone", user.profile?.contactInfo?.phone || "");
      setValue("website", user.profile?.contactInfo?.website || "");
      setValue("twitter", user.profile?.socialMedia?.twitter || "");
      setValue("linkedin", user.profile?.socialMedia?.linkedin || "");
      setValue("github", user.profile?.socialMedia?.github || "");

      if (user.profile?.avatar) {
        // Cloudinary URLs are absolute, local URLs need API URL prefix
        const avatarUrl = user.profile.avatar.startsWith("http")
          ? user.profile.avatar
          : `${import.meta.env.VITE_API_URL || "http://localhost:4001"}${
              user.profile.avatar
            }`;
        setImagePreview(avatarUrl);
      }
    }
  }, [user, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setSelectedFile(file);
    setImageUrl(""); // Clear URL if file is selected
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    toast.success("Image selected successfully");
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
      processImageFile(files[0]);
    }
  };

  // Handle image URL input
  const handleImageUrl = () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter a valid image URL");
      return;
    }

    // Check if URL is valid
    try {
      new URL(imageUrl);
    } catch (error) {
      toast.error("Please enter a valid URL");
      return;
    }

    // For Unsplash URLs, convert to direct image URL
    let finalUrl = imageUrl;
    if (imageUrl.includes("unsplash.com/photos/")) {
      // Extract photo ID from Unsplash URL
      const photoId = imageUrl.split("/photos/")[1]?.split("?")[0];
      if (photoId) {
        // Use Unsplash's direct image URL format
        finalUrl = `https://images.unsplash.com/photo-${photoId}?w=400&h=400&fit=crop`;
        toast.info("Converting Unsplash URL to direct image link...");
      }
    }

    // Test if image loads
    const img = new Image();
    img.onload = () => {
      setImagePreview(finalUrl);
      setSelectedFile(null); // Clear file if URL is used
      setShowUrlInput(false);
      toast.success("Image URL loaded successfully");
    };
    img.onerror = () => {
      toast.error(
        "Failed to load image from URL. Please check the URL and try again."
      );
    };
    img.src = finalUrl;
  };

  const handleDeleteImage = async () => {
    try {
      setLoading(true);
      await apiClient.delete("/profile/image");
      setImagePreview(null);
      setSelectedFile(null);
      toast.success("Profile image deleted successfully");

      // Update user context
      const updatedUser = { ...user, profile: { ...user.profile, avatar: "" } };
      updateUser(updatedUser);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete image");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Handle image upload/URL separately if needed
      if (selectedFile) {
        // Upload file
        const formData = new FormData();
        formData.append("profileImage", selectedFile);

        try {
          const imageResponse = await apiClient.put(
            "/profile/image",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Update user with new avatar
          if (imageResponse.data?.data?.user) {
            updateUser(imageResponse.data.data.user);
          }
        } catch (error) {
          console.error("Failed to upload image:", error);
          toast.error("Failed to upload profile image");
        }
      } else if (imagePreview && imagePreview.startsWith("http")) {
        // Save image URL
        try {
          const imageResponse = await apiClient.put("/profile/image-url", {
            imageUrl: imagePreview,
          });

          // Update user with new avatar
          if (imageResponse.data?.data?.user) {
            updateUser(imageResponse.data.data.user);
          }
        } catch (error) {
          console.error("Failed to save image URL:", error);
          toast.error("Failed to save image URL");
        }
      }

      // Update profile data using AuthContext
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username?.toLowerCase().trim() || undefined,
        bio: data.bio || undefined,
        contactInfo: {
          phone: data.phone || undefined,
          website: data.website || undefined,
        },
        socialMedia: {
          twitter: data.twitter || undefined,
          linkedin: data.linkedin || undefined,
          github: data.github || undefined,
        },
      };

      await updateProfile(profileData);

      // Navigate back to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Error toast is handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update your profile information and settings
            </p>
          </div>

          {/* Profile Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
                  Profile Picture
                </h3>

                {/* Image Preview */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-gray-500 dark:text-gray-400">
                          {getInitials(user?.firstName, user?.lastName)}
                        </span>
                      )}
                    </div>

                    {/* Quick Upload Button */}
                    <label className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Delete Image Button */}
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      disabled={loading}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 transition-colors inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Image
                    </button>
                  )}
                </div>

                {/* Drag and Drop Area */}
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500"
                  }`}
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isDragging
                      ? "Drop image here"
                      : "Drag and drop your image here"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    or click to browse (Max 5MB)
                  </p>
                </div>

                {/* URL Input Option */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>{showUrlInput ? "Hide" : "Use"} Image URL</span>
                  </button>

                  {showUrlInput && (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg or Unsplash URL"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleImageUrl}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                      >
                        Load Image from URL
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        💡 Tip: For Unsplash, paste the photo page URL (e.g.,
                        unsplash.com/photos/abc123)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    {...register("username", {
                      pattern: {
                        value: /^[a-zA-Z0-9_-]+$/,
                        message:
                          "Username can only contain letters, numbers, underscores, and hyphens",
                      },
                      minLength: {
                        value: 3,
                        message: "Username must be at least 3 characters",
                      },
                      maxLength: {
                        value: 30,
                        message: "Username cannot exceed 30 characters",
                      },
                      onChange: (e) => {
                        // Automatically convert to lowercase
                        const lowercaseValue = e.target.value.toLowerCase();
                        setValue("username", lowercaseValue);
                      },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Choose a unique username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.username.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Username will be automatically converted to lowercase (e.g.,
                    "Ab-xo" → "ab-xo")
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed dark:text-gray-400"
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...register("bio", {
                      maxLength: {
                        value: 500,
                        message: "Bio cannot exceed 500 characters",
                      },
                    })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.bio.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      {...register("phone")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+251 912 345 678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Website
                    </label>
                    <input
                      type="url"
                      {...register("website")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Social Media
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Twitter className="w-4 h-4 inline mr-1" />
                      Twitter
                    </label>
                    <input
                      type="text"
                      {...register("twitter")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Linkedin className="w-4 h-4 inline mr-1" />
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      {...register("linkedin")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Github className="w-4 h-4 inline mr-1" />
                      GitHub
                    </label>
                    <input
                      type="text"
                      {...register("github")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="github.com/username"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;
