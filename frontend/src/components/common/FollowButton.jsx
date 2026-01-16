import { useState, useEffect } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { followAPI } from "../../api/follow";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const FollowButton = ({
  userId,
  initialFollowing = false,
  onFollowChange,
  size = "md",
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    followersCount: 0,
    followingCount: 0,
  });

  // Don't show button if viewing own profile
  if (user && user._id === userId) {
    return null;
  }

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchFollowStatus();
    }
  }, [userId, isAuthenticated]);

  const fetchFollowStatus = async () => {
    try {
      const response = await followAPI.getFollowStatus(userId);
      if (response.success) {
        setIsFollowing(response.data.isFollowing);
        setCounts({
          followersCount: response.data.followersCount,
          followingCount: response.data.followingCount,
        });
      }
    } catch (error) {
      console.error("Error fetching follow status:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to follow users");
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        const response = await followAPI.unfollowUser(userId);
        if (response.success) {
          setIsFollowing(false);
          setCounts((prev) => ({
            ...prev,
            followersCount: response.data.followersCount,
          }));
          toast.success("Unfollowed successfully");
          onFollowChange?.(false, response.data);
        }
      } else {
        const response = await followAPI.followUser(userId);
        if (response.success) {
          setIsFollowing(true);
          setCounts((prev) => ({
            ...prev,
            followersCount: response.data.followersCount,
          }));
          toast.success("Following!");
          onFollowChange?.(true, response.data);
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error(
        error.response?.data?.message || "Failed to update follow status"
      );
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`
        inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200
        ${sizeClasses[size]}
        ${
          isFollowing
            ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isFollowing ? (
        <UserMinus className={iconSizes[size]} />
      ) : (
        <UserPlus className={iconSizes[size]} />
      )}
      <span>{isFollowing ? "Following" : "Follow"}</span>
    </button>
  );
};

export default FollowButton;
