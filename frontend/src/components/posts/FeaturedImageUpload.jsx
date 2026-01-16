import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const FeaturedImageUpload = ({ value, onChange, error }) => {
  const [imagePreview, setImagePreview] = useState(value || "");
  const [imageUrl, setImageUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileSelect = (file) => {
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
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      onChange(dataUrl);
      toast.success("Image selected successfully");
    };
    reader.readAsDataURL(file);
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
      const photoId = imageUrl.split("/photos/")[1]?.split("?")[0];
      if (photoId) {
        finalUrl = `https://images.unsplash.com/photo-${photoId}?w=1200&h=600&fit=crop`;
        toast.info("Converting Unsplash URL to direct image link...");
      }
    }

    // Test if image loads
    const img = new Image();
    img.onload = () => {
      setImagePreview(finalUrl);
      onChange(finalUrl);
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

  const clearImage = () => {
    setImagePreview("");
    setImageUrl("");
    onChange("");
  };

  return (
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
                  <li>Use high-quality images (1200x600px recommended)</li>
                  <li>Ensure the URL is publicly accessible</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FeaturedImageUpload;
