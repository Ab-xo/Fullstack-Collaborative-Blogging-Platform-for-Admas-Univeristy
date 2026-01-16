import express from 'express';
import BlogPost from '../models/BlogPost.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import cacheService, { CacheService } from '../services/cacheService.js';
import { getSettings } from '../middleware/settingsMiddleware.js';

const router = express.Router();

/**
 * Check maintenance status
 * GET /api/public/maintenance-status
 * Returns whether the platform is in maintenance mode
 */
router.get('/maintenance-status', async (req, res) => {
  try {
    const settings = await getSettings();
    res.status(200).json({
      success: true,
      maintenanceMode: settings?.general?.maintenanceMode || false,
      siteName: settings?.general?.siteName || 'Admas University Blog'
    });
  } catch (error) {
    console.error('Maintenance status error:', error);
    res.status(200).json({
      success: true,
      maintenanceMode: false
    });
  }
});

/**
 * Get public site settings
 * GET /api/public/site-settings
 * Returns site name, description, and other public settings
 */
router.get('/site-settings', async (req, res) => {
  try {
    const settings = await getSettings();
    res.status(200).json({
      success: true,
      settings: {
        siteName: settings?.general?.siteName || 'Admas University Collaborative Blogging',
        siteDescription: settings?.general?.siteDescription || 'A collaborative blogging platform for Admas University',
        contactEmail: settings?.general?.contactEmail || 'support@admas.edu.et',
        maintenanceMode: settings?.general?.maintenanceMode || false,
      }
    });
  } catch (error) {
    console.error('Site settings error:', error);
    res.status(200).json({
      success: true,
      settings: {
        siteName: 'Admas University Collaborative Blogging',
        siteDescription: 'A collaborative blogging platform for Admas University',
        contactEmail: 'support@admas.edu.et',
        maintenanceMode: false,
      }
    });
  }
});

// Category metadata for display
const categoryMeta = {
  'academic': { name: 'Academic', icon: '📚', description: 'General academic content and study tips' },
  'research': { name: 'Research', icon: '🔬', description: 'Research papers, findings, publications' },
  'thesis': { name: 'Thesis', icon: '📝', description: 'Thesis work and dissertations' },
  'tutorials': { name: 'Tutorials', icon: '💡', description: 'Educational tutorials and how-to guides' },
  'campus-life': { name: 'Campus Life', icon: '🏫', description: 'Daily life and student experiences' },
  'events': { name: 'Events', icon: '📅', description: 'University events, seminars, workshops' },
  'clubs': { name: 'Clubs', icon: '👥', description: 'Student clubs and organizations' },
  'sports': { name: 'Sports', icon: '⚽', description: 'Athletics, sports events, fitness' },
  'technology': { name: 'Technology', icon: '💻', description: 'Tech trends, software, digital tools' },
  'innovation': { name: 'Innovation', icon: '🚀', description: 'Startups, entrepreneurship, new ideas' },
  'engineering': { name: 'Engineering', icon: '⚙️', description: 'Engineering projects, technical content' },
  'science': { name: 'Science', icon: '🧪', description: 'Scientific discoveries, experiments' },
  'culture': { name: 'Culture', icon: '🎭', description: 'Cultural events, traditions, diversity' },
  'arts': { name: 'Arts', icon: '🎨', description: 'Visual arts, music, theater, creativity' },
  'literature': { name: 'Literature', icon: '📖', description: 'Creative writing, poetry, book reviews' },
  'career': { name: 'Career', icon: '💼', description: 'Job tips, internships, career advice' },
  'alumni': { name: 'Alumni', icon: '🎓', description: 'Alumni stories, success stories' },
  'opinion': { name: 'Opinion', icon: '💬', description: 'Opinion pieces, editorials' },
  'announcements': { name: 'Announcements', icon: '📢', description: 'Official announcements, news' },
  'other': { name: 'Other', icon: '📁', description: 'Miscellaneous content' }
};

/**
 * Public Stats Route
 * GET /api/public/stats
 * Returns platform statistics for the landing page
 */
router.get('/stats', async (req, res) => {
  try {
    // Try cache first
    const cacheKey = CacheService.keys.stats();
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const [
      totalPosts,
      totalUsers,
      totalComments,
      recentPosts,
      categoryStats
    ] = await Promise.all([
      // Count published posts
      BlogPost.countDocuments({ status: 'published' }),
      // Count active users (all users except banned)
      User.countDocuments({ status: { $ne: 'banned' } }),
      // Count comments
      Comment.countDocuments(),
      // Get recent posts for preview
      BlogPost.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('title excerpt featuredImage author category createdAt likesCount commentsCount views slug')
        .populate('author', 'username firstName lastName profile bio')
        .lean(),
      // Get category stats
      BlogPost.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', postCount: { $sum: 1 } } },
        { $sort: { postCount: -1 } },
        { $limit: 6 }
      ])
    ]);

    // Transform category stats with metadata
    const topCategories = categoryStats.map(cat => ({
      _id: cat._id,
      slug: cat._id,
      name: categoryMeta[cat._id]?.name || cat._id,
      icon: categoryMeta[cat._id]?.icon || '📁',
      description: categoryMeta[cat._id]?.description || '',
      postCount: cat.postCount
    }));

    // Transform recent posts to add category info and normalize author data
    const transformedPosts = recentPosts.map(post => ({
      ...post,
      viewsCount: post.views || 0,
      category: post.category ? {
        name: categoryMeta[post.category]?.name || post.category,
        slug: post.category
      } : null,
      author: post.author ? {
        ...post.author,
        profilePicture: post.author.profile?.avatar || null
      } : null
    }));

    // Calculate engagement stats
    const engagementStats = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likesCount' },
          totalComments: { $sum: '$commentsCount' }
        }
      }
    ]);

    const engagement = engagementStats[0] || { totalViews: 0, totalLikes: 0, totalComments: 0 };

    const response = {
      success: true,
      data: {
        stats: {
          totalPosts,
          totalUsers,
          totalCategories: Object.keys(categoryMeta).length,
          totalComments,
          totalViews: engagement.totalViews,
          totalLikes: engagement.totalLikes
        },
        recentPosts: transformedPosts,
        topCategories
      }
    };

    // Cache for 1 minute
    await cacheService.set(cacheKey, response, CacheService.ttl.stats);

    res.status(200).json(response);
  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics'
    });
  }
});

/**
 * Get featured/trending posts
 * GET /api/public/featured
 */
router.get('/featured', async (req, res) => {
  try {
    // Try cache first
    const cacheKey = CacheService.keys.featured();
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const featuredPosts = await BlogPost.find({ status: 'published' })
      .sort({ views: -1, likesCount: -1 })
      .limit(6)
      .select('title excerpt featuredImage author category createdAt likesCount commentsCount views slug')
      .populate('author', 'username firstName lastName profile bio')
      .lean();

    // Transform posts with category info and normalize author data
    const transformedPosts = featuredPosts.map(post => ({
      ...post,
      viewsCount: post.views || 0,
      category: post.category ? {
        name: categoryMeta[post.category]?.name || post.category,
        slug: post.category
      } : null,
      author: post.author ? {
        ...post.author,
        profilePicture: post.author.profile?.avatar || null
      } : null
    }));

    const response = {
      success: true,
      data: transformedPosts
    };

    // Cache for 3 minutes
    await cacheService.set(cacheKey, response, CacheService.ttl.featured);

    res.status(200).json(response);
  } catch (error) {
    console.error('Featured posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured posts'
    });
  }
});

/**
 * Get top authors
 * GET /api/public/top-authors
 * Returns only regular authors (excludes admin and moderator roles)
 */
router.get('/top-authors', async (req, res) => {
  try {
    // Skip cache to always get fresh data
    // const cacheKey = CacheService.keys.topAuthors();
    // const cached = await cacheService.get(cacheKey);
    // if (cached) {
    //   return res.status(200).json(cached);
    // }

    const topAuthors = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likesCount' }
        }
      },
      // Sort by engagement (views + likes) rather than just post count
      { $sort: { totalViews: -1, totalLikes: -1, postCount: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      // Filter out admin and moderator users - only show regular authors
      {
        $match: {
          'author.role': { $nin: ['admin', 'moderator'] }
        }
      },
      { $limit: 10 },
      {
        $project: {
          _id: '$author._id',
          username: '$author.username',
          firstName: '$author.firstName',
          lastName: '$author.lastName',
          profilePicture: '$author.profile.avatar',
          bio: '$author.bio',
          role: '$author.role',
          department: '$author.department',
          postCount: 1,
          totalViews: 1,
          totalLikes: 1
        }
      }
    ]);

    // Transform to include display name
    const transformedAuthors = topAuthors.map(author => ({
      ...author,
      displayName: author.firstName && author.lastName 
        ? `${author.firstName} ${author.lastName}`
        : author.username || 'Community Member',
      roleTitle: getRoleTitle(author.role, author.department)
    }));

    // Filter out duplicates by display name (keep the one with highest views)
    const uniqueAuthors = transformedAuthors.filter((author, index, self) => {
      return index === self.findIndex(a => a.displayName === author.displayName);
    });

    const response = {
      success: true,
      data: uniqueAuthors
    };

    // Cache disabled for now
    // await cacheService.set(cacheKey, response, CacheService.ttl.topAuthors);

    res.status(200).json(response);
  } catch (error) {
    console.error('Top authors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top authors'
    });
  }
});

/**
 * Get all categories with post counts
 * GET /api/public/categories
 */
router.get('/categories', async (req, res) => {
  try {
    // Try cache first
    const cacheKey = CacheService.keys.categories();
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const categoryStats = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', postCount: { $sum: 1 } } },
      { $sort: { postCount: -1 } }
    ]);

    const categories = Object.keys(categoryMeta).map(slug => {
      const stats = categoryStats.find(c => c._id === slug);
      return {
        _id: slug,
        slug,
        name: categoryMeta[slug].name,
        icon: categoryMeta[slug].icon,
        description: categoryMeta[slug].description,
        postCount: stats?.postCount || 0
      };
    });

    const response = {
      success: true,
      data: categories
    };

    // Cache for 10 minutes
    await cacheService.set(cacheKey, response, CacheService.ttl.categories);

    res.status(200).json(response);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

/**
 * Get active community members (for testimonials)
 * GET /api/public/active-members
 * Returns users who have published posts and have engagement
 */
router.get('/active-members', async (req, res) => {
  try {
    // Find users who have published posts with good engagement
    const activeMembers = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likesCount' },
          totalComments: { $sum: '$commentsCount' }
        }
      },
      // Only include users with at least 1 post
      { $match: { postCount: { $gte: 1 } } },
      // Sort by engagement (likes + comments + views)
      { 
        $addFields: { 
          engagementScore: { 
            $add: [
              { $multiply: ['$totalLikes', 3] },
              { $multiply: ['$totalComments', 2] },
              '$totalViews'
            ]
          }
        }
      },
      { $sort: { engagementScore: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      // Filter out admin and moderator users - only show regular authors
      {
        $match: {
          'user.role': { $nin: ['admin', 'moderator'] }
        }
      },
      {
        $project: {
          _id: '$user._id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          username: '$user.username',
          role: '$user.role',
          department: '$user.department',
          profile: '$user.profile',
          postCount: 1,
          totalViews: 1,
          totalLikes: 1,
          totalComments: 1,
          engagementScore: 1
        }
      }
    ]);

    // Transform to include avatar URL
    const transformedMembers = activeMembers.map(member => ({
      ...member,
      avatar: member.profile?.avatar || null,
      displayName: member.firstName && member.lastName 
        ? `${member.firstName} ${member.lastName}`
        : member.username || 'Community Member',
      roleTitle: getRoleTitle(member.role, member.department)
    }));

    res.status(200).json({
      success: true,
      data: transformedMembers
    });
  } catch (error) {
    console.error('Active members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active members'
    });
  }
});

// Helper function to get role title
function getRoleTitle(role, department) {
  const roleTitles = {
    'admin': 'Platform Administrator',
    'moderator': 'Content Moderator',
    'author': department ? `${department} Contributor` : 'Content Creator',
    'reader': 'Active Community Member'
  };
  return roleTitles[role] || 'Community Member';
}

export default router;
