import * as feedService from '../services/feedService.js';

/**
 * @desc    Get following feed for current user
 * @route   GET /api/feed/following
 * @access  Private
 */
export const getFollowingFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page, limit, category, sortBy } = req.query;

    const feedData = await feedService.getFollowingFeed(userId, {
      page,
      limit,
      category,
      sortBy
    });

    res.status(200).json({
      success: true,
      data: feedData
    });
  } catch (error) {
    console.error('Error getting following feed:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving following feed',
      error: error.message
    });
  }
};

/**
 * @desc    Get list of authors current user is following
 * @route   GET /api/feed/following/authors
 * @access  Private
 */
export const getFollowedAuthors = async (req, res) => {
  try {
    const userId = req.user._id;

    const authors = await feedService.getFollowedAuthors(userId);

    res.status(200).json({
      success: true,
      data: authors
    });
  } catch (error) {
    console.error('Error getting followed authors:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving followed authors',
      error: error.message
    });
  }
};

/**
 * @desc    Get suggested authors to follow
 * @route   GET /api/feed/suggestions
 * @access  Private
 */
export const getSuggestedAuthors = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 5 } = req.query;

    const suggestions = await feedService.getSuggestedAuthors(userId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error getting author suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving author suggestions',
      error: error.message
    });
  }
};
