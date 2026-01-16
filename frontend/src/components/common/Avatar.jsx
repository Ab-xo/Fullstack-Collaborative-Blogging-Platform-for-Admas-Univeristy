import { useState } from "react";

const Avatar = ({ src, alt, size = "md", fallback, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizes = {
    xs: "w-9 h-9 text-xs",
    sm: "w-11 h-11 text-sm",
    md: "w-14 h-14 text-base",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
    "2xl": "w-32 h-32 text-4xl",
  };

  // Generate initials from fallback text
  const getInitials = (text) => {
    if (!text) return "?";
    const words = text.trim().split(" ").filter(Boolean);
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const showImage = src && !imageError;

  return (
    <div
      className={`${sizes[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0 relative ${className}`}
    >
      {showImage ? (
        <>
          <img
            src={src}
            alt={alt || "Avatar"}
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-200 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
          {/* Show initials while image is loading */}
          {!imageLoaded && (
            <span className="z-10">
              {getInitials(fallback || alt || "User")}
            </span>
          )}
        </>
      ) : (
        <span>{getInitials(fallback || alt || "User")}</span>
      )}
    </div>
  );
};

export default Avatar;
