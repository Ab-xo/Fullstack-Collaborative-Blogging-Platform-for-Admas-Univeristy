import Follow from '../models/Follow.js';
import BlogPost from '../models/BlogPost.js';
import User from '../models/User.js';

/**
 * Feed Service
 * Handles business logic for following feed generation
 */

/**
 * Get following feed for a user
 * @param {String} userId - Current user ID
 * @param {Object} options - Query options (page, limit, category, sortBy)
 * @returns {Object} Feed data with posts and pagination
 */
export const getFollowingFeed = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    category = null,
    sortBy = 'newest'
  } = options;

  // Validate pagination parameters
  const validatedPage = Math.max(1, parseInt(page));
  const validatedLimit = Math.min(50, Math.max(1, parseInt(limit)));

  // Get list of authors the user is following
  const followingList = await Follow.find({ follower: userId }).select('following');
  const followingIds = followingList.map(f => f.following);

  // If not following anyone, return empty feed
  if (followingIds.length === 0) {
    return {
      posts: [],
      pagination: {
        currentPage: validatedPage,
        totalPages: 0,
        totalPosts: 0,
        hasMore: false,
        limit: validatedLimit
      },
      followingCount: 0
    };
  }

  // Build query for published posts from followed authors
  const query = {
    author: { $in: followingIds },
    status: 'published'
  };

  // Add category filter if provided
  if (category) {
    query.category = category;
  }

  // Determine sort order
  let sortOptions = {};
  switch (sortBy) {
    case 'mostLiked':
      sortOptions = { likesCount: -1, publishedAt: -1 };
      break;
    case 'mostViewed':
      sortOptions = { views: -1, publishedAt: -1 };
      break;
    case 'newest':
    default:
      sortOptions = { publishedAt: -1 };
      break;
  }

  // Get total count for pagination
  const totalPosts = await BlogPost.countDocuments(query);

  // Fetch posts with pagination
  const posts = await BlogPost.find(query)
    .populate('author', 'firstName lastName email profile')
    .sort(sortOptions)
    .skip((validatedPage - 1) * validatedLimit)
    .limit(validatedLimit)
    .select('-__v')
    .lean();

  // Add isLikedByCurrentUser field to each post
  const postsWithLikeState = posts.map(post => ({
    ...post,
    isLikedByCurrentUser: post.likes ? post.likes.some(id => id.toString() === userId.toString()) : false
  }));

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalPosts / validatedLimit);
  const hasMore = validatedPage < totalPages;

  return {
    posts: postsWithLikeState,
    pagination: {
      currentPage: validatedPage,
      totalPages,
      totalPosts,
      hasMore,
      limit: validatedLimit
    },
    followingCount: followingIds.length
  };
};

/**
 * Get list of authors the user is following
 * @param {String} userId - Current user ID
 * @returns {Array} List of followed authors with metadata
 */
export const getFollowedAuthors = async (userId) => {
  const followingList = await Follow.find({ follower: userId })
    .populate('following', 'firstName lastName email profile')
    .sort({ createdAt: -1 })
    .lean();

  // Get follower counts for each followed author
  const authorsWithCounts = await Promise.all(
    followingList.map(async (follow) => {
      const followerCount = await Follow.countDocuments({ following: follow.following._id });
      return {
        ...follow.following,
        followerCount
      };
    })
  );

  return authorsWithCounts;
};

/**
 * Get suggested authors to follow
 * @param {String} userId - Current user ID
 * @param {Number} limit - Number of suggestions
 * @returns {Array} List of suggested authors
 */
export const getSuggestedAuthors = async (userId, limit = 5) => {
  // Get authors the user is already following
  const followingList = await Follow.find({ follower: userId }).select('following');
  const followingIds = followingList.map(f => f.following.toString());
  
  // Add current user to exclusion list
  followingIds.push(userId.toString());

  // Find authors with most followers who user isn't following
  const suggestions = await User.aggregate([
    // Exclude users already followed and current user
    { $match: { _id: { $nin: followingIds.map(id => id) }, role: { $in: ['author', 'admin'] } } },
    
    // Lookup follower count
    {
      $lookup: {
        from: 'follows',
        localField: '_id',
        foreignField: 'following',
        as: 'followers'
      }
    },
    
    // Add follower count field
    { $addFields: { followerCount: { $size: '$followers' } } },
    
    // Sort by follower count
    { $sort: { followerCount: -1 } },
    
    // Limit results
    { $limit: limit },
    
    // Project only needed fields
    {
      $project: {
        firstName: 1,
        lastName: 1,
        email: 1,
        profile: 1,
        followerCount: 1
      }
    }
  ]);

  return suggestions;
};
