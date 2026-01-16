import Follow from '../models/Follow.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';

/**
 * @desc    Follow a user
 * @route   POST /api/users/:userId/follow
 * @access  Private
 */
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;

    // Can't follow yourself
    if (userId === followerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Create follow relationship
    await Follow.create({
      follower: followerId,
      following: userId
    });

    // Send notification to the followed user
    try {
      const followerName = `${req.user.firstName} ${req.user.lastName}`;
      await NotificationService.notifyNewFollower(userId, followerId, followerName);
    } catch (notifError) {
      console.error('Error sending follow notification:', notifError);
    }

    // Get updated counts
    const counts = await Follow.getCounts(userId);

    res.status(200).json({
      success: true,
      message: 'Successfully followed user',
      data: {
        isFollowing: true,
        ...counts
      }
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({
      success: false,
      message: 'Error following user',
      error: error.message
    });
  }
};

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/users/:userId/follow
 * @access  Private
 */
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;

    // Can't unfollow yourself
    if (userId === followerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot unfollow yourself'
      });
    }

    // Remove follow relationship
    const result = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId
    });

    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    // Get updated counts
    const counts = await Follow.getCounts(userId);

    res.status(200).json({
      success: true,
      message: 'Successfully unfollowed user',
      data: {
        isFollowing: false,
        ...counts
      }
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({
      success: false,
      message: 'Error unfollowing user',
      error: error.message
    });
  }
};

/**
 * @desc    Get followers of a user
 * @route   GET /api/users/:userId/followers
 * @access  Public
 */
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await Follow.getFollowers(userId, { page: parseInt(page), limit: parseInt(limit) });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting followers:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting followers',
      error: error.message
    });
  }
};

/**
 * @desc    Get users that a user is following
 * @route   GET /api/users/:userId/following
 * @access  Public
 */
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await Follow.getFollowing(userId, { page: parseInt(page), limit: parseInt(limit) });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting following:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting following',
      error: error.message
    });
  }
};

/**
 * @desc    Check if current user is following a user
 * @route   GET /api/users/:userId/follow/status
 * @access  Private
 */
export const getFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;

    const isFollowing = await Follow.isFollowing(followerId, userId);
    const counts = await Follow.getCounts(userId);

    res.status(200).json({
      success: true,
      data: {
        isFollowing,
        ...counts
      }
    });
  } catch (error) {
    console.error('Error getting follow status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting follow status',
      error: error.message
    });
  }
};
