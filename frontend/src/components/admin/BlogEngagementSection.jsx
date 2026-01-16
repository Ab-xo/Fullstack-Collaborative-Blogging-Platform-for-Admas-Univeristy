import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, TrendingUp, User } from "lucide-react";
import { postsAPI } from "../../api/posts";
import { formatNumber } from "../../utils/blogUtils";
import { formatDistanceToNow } from "date-fns";

/**
 * Blog Engagement Section for Admin Dashboard
 * Shows which blogs are being viewed and who liked them
 */
const BlogEngagementSection = () => {
  const [topViewedPosts, setTopViewedPosts] = useState([]);
  const [topLikedPosts, setTopLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    try {
      setLoading(true);

      // Fetch top viewed posts
      const viewedResponse = await postsAPI.getPosts({
        sort: "views",
        limit: 5,
      });

      // Fetch top liked posts
      const likedResponse = await postsAPI.getPosts({
        sort: "likes",
        limit: 5,
      });

      if (viewedResponse?.data?.posts) {
        setTopViewedPosts(viewedResponse.data.posts);
      }

      if (likedResponse?.data?.posts) {
        setTopLikedPosts(likedResponse.data.posts);
      }
    } catch (error) {
      console.error("Error fetching engagement data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top Viewed Posts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Most Viewed Posts
              </CardTitle>
              <CardDescription>
                Posts with the highest view counts
              </CardDescription>
            </div>
            <Badge variant="secondary">
              <TrendingUp className="h-3 w-3 mr-1" />
              Top 5
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {topViewedPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No posts with views yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topViewedPosts.map((post, index) => (
                <div
                  key={post._id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Post Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author?.firstName} {post.author?.lastName}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* View Count */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                      <Eye className="h-4 w-4" />
                      <span>{formatNumber(post.views || 0)}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      views
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Liked Posts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Most Liked Posts
              </CardTitle>
              <CardDescription>
                Posts with the most likes and engagement
              </CardDescription>
            </div>
            <Badge variant="secondary">
              <TrendingUp className="h-3 w-3 mr-1" />
              Top 5
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {topLikedPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No posts with likes yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topLikedPosts.map((post, index) => (
                <div
                  key={post._id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Post Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author?.firstName} {post.author?.lastName}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {/* Show who liked (if available) */}
                    {post.likes && post.likes.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <span>
                          Liked by {post.likes.length}{" "}
                          {post.likes.length === 1 ? "user" : "users"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Like Count */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                      <Heart className="h-4 w-4 fill-current" />
                      <span>{formatNumber(post.likesCount || 0)}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      likes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogEngagementSection;
