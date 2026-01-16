import BlogPost from '../models/blogpost/index.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * @desc    Get admin dashboard analytics
 * @route   GET /api/analytics/admin/dashboard
 * @access  Private (Admin only)
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter if provided
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get all available categories from the schema enum
    const availableCategories = BlogPost.schema.path('category').enumValues || [];
    
    // Platform Stats
    const [totalUsers, totalPosts] = await Promise.all([
      User.countDocuments(),
      BlogPost.countDocuments()
    ]);
    
    // Total categories is the number of predefined categories in the schema
    const totalCategories = availableCategories.length;

    // User Distribution by Role - Determine each user's effective role
    // Priority: Check 'roles' array first (if contains admin/moderator/author), then 'role' field
    const allRoles = ['admin', 'moderator', 'author', 'reader'];
    
    // Get all users with their role information
    const usersWithRoles = await User.aggregate([
      {
        $project: {
          role: 1,
          roles: 1,
          // Determine effective role: prioritize roles array, fallback to role field
          effectiveRole: {
            $cond: {
              if: { $and: [{ $isArray: '$roles' }, { $gt: [{ $size: '$roles' }, 0] }] },
              then: {
                $cond: {
                  if: { $in: ['admin', '$roles'] },
                  then: 'admin',
                  else: {
                    $cond: {
                      if: { $in: ['moderator', '$roles'] },
                      then: 'moderator',
                      else: {
                        $cond: {
                          if: { $in: ['author', '$roles'] },
                          then: 'author',
                          else: { $ifNull: ['$role', 'reader'] }
                        }
                      }
                    }
                  }
                }
              },
              else: { $ifNull: ['$role', 'reader'] }
            }
          }
        }
      },
      {
        $group: {
          _id: '$effectiveRole',
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map of role counts
    const roleCountMap = {};
    usersWithRoles.forEach(item => {
      if (item._id && allRoles.includes(item._id)) {
        roleCountMap[item._id] = item.count;
      }
    });

    // Ensure all roles are included, even with 0 count
    const userDistribution = allRoles.map(role => ({
      role: role,
      count: roleCountMap[role] || 0
    }));

    // Post Status Distribution
    const postStatusDistribution = await BlogPost.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          percentage: {
            $multiply: [
              { $divide: ['$count', totalPosts] },
              100
            ]
          },
          _id: 0
        }
      }
    ]);

    // Engagement Trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const engagementTrends = await BlogPost.aggregate([
      {
        $match: {
          status: 'published',
          publishedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' }
          },
          views: { $sum: '$views' },
          likes: { $sum: '$likesCount' },
          comments: { $sum: '$commentsCount' },
          posts: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          views: 1,
          likes: 1,
          comments: 1,
          posts: 1,
          _id: 0
        }
      }
    ]);

    // Top Categories
    const topCategories = await BlogPost.aggregate([
      {
        $match: { status: 'published' }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalComments: { $sum: '$commentsCount' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          totalViews: 1,
          totalComments: 1,
          percentage: {
            $multiply: [
              { $divide: ['$count', totalPosts] },
              100
            ]
          },
          _id: 0
        }
      }
    ]);

    // Get moderation stats
    const [pendingPosts, approvedPosts, rejectedPosts] = await Promise.all([
      BlogPost.countDocuments({ status: 'pending' }),
      BlogPost.countDocuments({ status: 'published' }),
      BlogPost.countDocuments({ status: 'rejected' })
    ]);
    
    const totalModerated = approvedPosts + rejectedPosts;
    const approvalRate = totalModerated > 0 ? Math.round((approvedPosts / totalModerated) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        platformStats: {
          totalUsers,
          totalPosts,
          totalCategories,
          activeUsers: await User.countDocuments({ status: 'approved' }),
          newUsersThisMonth: await User.countDocuments({
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          })
        },
        userDistribution,
        postStatusDistribution,
        engagementTrends,
        topCategories,
        moderationStats: {
          pending: pendingPosts,
          approved: approvedPosts,
          rejected: rejectedPosts,
          approvalRate
        }
      }
    });
  } catch (error) {
    console.error('Error in getAdminDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Get moderator dashboard analytics
 * @route   GET /api/analytics/moderator/dashboard
 * @access  Private (Moderator/Admin)
 */
export const getModeratorDashboard = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    // Build filters
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.moderatedAt = {};
      if (startDate) dateFilter.moderatedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.moderatedAt.$lte = new Date(endDate);
    }

    const categoryFilter = category ? { category } : {};

    // Moderation Stats
    const [pending, approved, rejected] = await Promise.all([
      BlogPost.countDocuments({ status: 'pending', ...categoryFilter }),
      BlogPost.countDocuments({ status: 'published', ...dateFilter, ...categoryFilter }),
      BlogPost.countDocuments({ status: 'rejected', ...dateFilter, ...categoryFilter })
    ]);

    const totalModerated = approved + rejected;
    const approvalRate = totalModerated > 0 ? Math.round((approved / totalModerated) * 100) : 0;

    // Moderation Trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const moderationTrends = await BlogPost.aggregate([
      {
        $match: {
          status: { $in: ['published', 'rejected'] },
          moderatedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$moderatedAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          approved: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'published'] }, '$count', 0]
            }
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'rejected'] }, '$count', 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          approved: 1,
          rejected: 1,
          _id: 0
        }
      }
    ]);

    // Category Workload
    const categoryWorkload = await BlogPost.aggregate([
      {
        $match: { status: 'pending' }
      },
      {
        $group: {
          _id: '$category',
          pending: { $sum: 1 }
        }
      },
      {
        $sort: { pending: -1 }
      },
      {
        $project: {
          category: '$_id',
          pending: 1,
          _id: 0
        }
      }
    ]);

    // Performance Metrics
    const performanceMetrics = {
      avgReviewTime: 0, // TODO: Calculate based on moderatedAt - createdAt
      dailyCount: await BlogPost.countDocuments({
        status: { $in: ['published', 'rejected'] },
        moderatedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      weeklyCount: await BlogPost.countDocuments({
        status: { $in: ['published', 'rejected'] },
        moderatedAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      })
    };

    res.status(200).json({
      success: true,
      data: {
        moderationStats: {
          pending,
          approved,
          rejected,
          approvalRate
        },
        moderationTrends,
        categoryWorkload,
        performanceMetrics
      }
    });
  } catch (error) {
    console.error('Error in getModeratorDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching moderator dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Get author dashboard analytics
 * @route   GET /api/analytics/author/dashboard
 * @access  Private (Author)
 */
export const getAuthorDashboard = async (req, res) => {
  try {
    const authorId = req.user._id;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = { author: authorId };
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Author Stats
    const [totalPosts, published, pending, rejected, draft] = await Promise.all([
      BlogPost.countDocuments({ author: authorId }),
      BlogPost.countDocuments({ author: authorId, status: 'published' }),
      BlogPost.countDocuments({ author: authorId, status: 'pending' }),
      BlogPost.countDocuments({ author: authorId, status: 'rejected' }),
      BlogPost.countDocuments({ author: authorId, status: 'draft' })
    ]);

    // Aggregate engagement metrics
    const engagementStats = await BlogPost.aggregate([
      {
        $match: { author: new mongoose.Types.ObjectId(authorId), status: 'published' }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likesCount' },
          totalComments: { $sum: '$commentsCount' }
        }
      }
    ]);

    const { totalViews = 0, totalLikes = 0, totalComments = 0 } = engagementStats[0] || {};

    // Post Performance
    const postPerformance = await BlogPost.find({
      author: authorId,
      status: 'published'
    })
      .select('title views commentsCount likesCount publishedAt category')
      .sort({ views: -1 })
      .limit(10)
      .lean();

    // Engagement Trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const engagementTrends = await BlogPost.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(authorId),
          status: 'published',
          publishedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' }
          },
          views: { $sum: '$views' },
          likes: { $sum: '$likesCount' },
          comments: { $sum: '$commentsCount' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          views: 1,
          likes: 1,
          comments: 1,
          _id: 0
        }
      }
    ]);

    // Status Distribution
    const statusDistribution = [
      { status: 'published', count: published },
      { status: 'pending', count: pending },
      { status: 'rejected', count: rejected },
      { status: 'draft', count: draft }
    ].filter(item => item.count > 0);

    // Category Distribution
    const categoryDistribution = await BlogPost.aggregate([
      {
        $match: { author: new mongoose.Types.ObjectId(authorId) }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Publishing Activity by Month
    const publishingActivity = await BlogPost.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(authorId),
          status: 'published'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$publishedAt' },
            month: { $month: '$publishedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        authorStats: {
          totalPosts,
          published,
          pending,
          rejected,
          draft,
          totalViews,
          totalLikes,
          totalComments
        },
        postPerformance,
        engagementTrends,
        statusDistribution,
        categoryDistribution,
        publishingActivity
      }
    });
  } catch (error) {
    console.error('Error in getAuthorDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching author dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Get post trends
 * @route   GET /api/analytics/posts/trends
 * @access  Private (Admin/Moderator)
 */
export const getPostTrends = async (req, res) => {
  try {
    const { period = 'day', limit = 30 } = req.query;

    let dateFormat;
    let dateSubtract;

    switch (period) {
      case 'week':
        dateFormat = '%Y-W%U';
        dateSubtract = 12 * 7; // 12 weeks
        break;
      case 'month':
        dateFormat = '%Y-%m';
        dateSubtract = 12 * 30; // 12 months
        break;
      default:
        dateFormat = '%Y-%m-%d';
        dateSubtract = parseInt(limit);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateSubtract);

    const trends = await BlogPost.aggregate([
      {
        $match: {
          publishedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$publishedAt' }
          },
          published: { $sum: 1 },
          views: { $sum: '$views' },
          comments: { $sum: '$commentsCount' },
          likes: { $sum: '$likesCount' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          published: 1,
          views: 1,
          comments: 1,
          likes: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    console.error('Error in getPostTrends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post trends',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Get user activity
 * @route   GET /api/analytics/users/activity
 * @access  Private (Admin)
 */
export const getUserActivity = async (req, res) => {
  try {
    // Top active users by post count
    const userActivity = await BlogPost.aggregate([
      {
        $match: { status: 'published' }
      },
      {
        $group: {
          _id: '$author',
          postsCount: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalComments: { $sum: '$commentsCount' }
        }
      },
      {
        $sort: { postsCount: -1 }
      },
      {
        $limit: 20
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          postsCount: 1,
          totalViews: 1,
          totalComments: 1,
          lastActive: '$user.lastLogin',
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: { userActivity }
    });
  } catch (error) {
    console.error('Error in getUserActivity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Get category statistics
 * @route   GET /api/analytics/categories/stats
 * @access  Private (Admin/Moderator)
 */
export const getCategoryStats = async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      {
        $group: {
          _id: '$category',
          totalPosts: { $sum: 1 },
          publishedPosts: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          pendingPosts: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          avgViews: { $avg: '$views' },
          avgComments: { $avg: '$commentsCount' },
          avgLikes: { $avg: '$likesCount' }
        }
      },
      {
        $sort: { totalPosts: -1 }
      },
      {
        $project: {
          category: '$_id',
          totalPosts: 1,
          publishedPosts: 1,
          pendingPosts: 1,
          avgViews: { $round: ['$avgViews', 0] },
          avgComments: { $round: ['$avgComments', 0] },
          avgLikes: { $round: ['$avgLikes', 0] },
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Error in getCategoryStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Get network interactions (for D3 visualizations)
 * @route   GET /api/analytics/network/interactions
 * @access  Private (Admin)
 */
export const getNetworkInteractions = async (req, res) => {
  try {
    // This is a simplified version - can be expanded based on needs
    // Get authors and their post counts
    const authorNodes = await BlogPost.aggregate([
      {
        $match: { status: 'published' }
      },
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          id: { $toString: '$_id' },
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          type: 'user',
          value: '$postCount',
          group: { $arrayElemAt: ['$categories', 0] },
          _id: 0
        }
      },
      {
        $limit: 50
      }
    ]);

    // Create links based on shared categories
    const links = [];
    // This is a placeholder - implement actual link logic based on your needs

    res.status(200).json({
      success: true,
      data: {
        nodes: authorNodes,
        links
      }
    });
  } catch (error) {
    console.error('Error in getNetworkInteractions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching network interactions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export default {
  getAdminDashboard,
  getModeratorDashboard,
  getAuthorDashboard,
  getPostTrends,
  getUserActivity,
  getCategoryStats,
  getNetworkInteractions
};
