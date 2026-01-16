import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Eye, Calendar } from "lucide-react";
import { likePost, unlikePost } from "../../api/posts";
import { formatDistanceToNow } from "date-fns";

const FeedPostCard = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    if (isLiking) return;

    setIsLiking(true);
    const previousState = { isLiked, likesCount };

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      if (isLiked) {
        await unlikePost(post._id);
      } else {
        await likePost(post._id);
      }
      // Optionally refetch feed
      if (onUpdate) onUpdate();
    } catch (error) {
      // Rollback on error
      setIsLiked(previousState.isLiked);
      setLikesCount(previousState.likesCount);
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const getAuthorName = () => {
    if (post.author) {
      return `${post.author.firstName} ${post.author.lastName}`;
    }
    return "Unknown Author";
  };

  const getAuthorAvatar = () => {
    return post.author?.profile?.avatar || "/default-avatar.png";
  };

  const formatDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  return (
    <Link to={`/posts/${post.slug || post._id}`} className="block">
      <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="aspect-video w-full overflow-hidden bg-gray-200">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-6">
          {/* Author Info */}
          <div className="flex items-center mb-4">
            <img
              src={getAuthorAvatar()}
              alt={getAuthorName()}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div>
              <Link
                to={`/profile/${post.author?._id}`}
                className="font-medium text-gray-900 hover:text-blue-600"
                onClick={(e) => e.stopPropagation()}
              >
                {getAuthorName()}
              </Link>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(post.publishedAt)}
              </div>
            </div>
          </div>

          {/* Category Badge */}
          {post.category && (
            <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-3">
              {post.category.replace("-", " ")}
            </span>
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
          )}

          {/* Engagement Metrics */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 transition ${
                isLiked ? "text-red-600" : "text-gray-600 hover:text-red-600"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            {/* Comments */}
            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                {post.commentsCount || 0}
              </span>
            </div>

            {/* Views */}
            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium">{post.views || 0}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default FeedPostCard;
