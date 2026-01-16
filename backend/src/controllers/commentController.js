import Comment from '../models/Comment.js';
import BlogPost from '../models/blogpost/index.js';
import mongoose from 'mongoose';

// @desc    Get all comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // Verify post exists - try by ID first, then by slug
    let post;
    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await BlogPost.findById(postId);
    }
    
    // If not found by ID or ID is invalid, try slug
    if (!post) {
      post = await BlogPost.findOne({ slug: postId });
    }
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Get comments with replies using the actual post _id
    const comments = await Comment.getCommentsWithReplies(post._id);

    // Add isLiked flag for authenticated users
    const commentsWithLikeStatus = comments.map(comment => {
      const commentObj = { ...comment };
      if (req.user) {
        commentObj.isLiked = comment.likes?.some(
          like => like.toString() === req.user._id.toString()
        );
      }
      
      // Process replies
      if (commentObj.replies) {
        commentObj.replies = commentObj.replies.map(reply => ({
          ...reply,
          isLiked: req.user ? reply.likes?.some(
            like => like.toString() === req.user._id.toString()
          ) : false,
        }));
      }
      
      return commentObj;
    });

    res.status(200).json({
      success: true,
      data: {
        comments: commentsWithLikeStatus,
        count: comments.length,
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Create a comment
// @route   POST /api/posts/:postId/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    // Verify post exists - try by ID first, then by slug
    let post;
    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await BlogPost.findById(postId);
    }
    
    // If not found by ID or ID is invalid, try slug
    if (!post) {
      post = await BlogPost.findOne({ slug: postId });
    }
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // If replying, verify parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found',
        });
      }
    }

    // Create comment using the actual post _id
    const comment = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      post: post._id,
      parentComment: parentCommentId || null,
    });

    // Populate author info
    await comment.populate('author', 'firstName lastName email profile');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: {
        comment: {
          ...comment.toObject(),
          isLiked: false,
          replies: [],
        },
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment',
      });
    }

    // Update comment
    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    await comment.populate('author', 'firstName lastName email profile');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment,
      },
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user is the author or admin
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.roles?.includes('admin') || req.user.roles?.includes('moderator');

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    // Delete all replies first
    await Comment.deleteMany({ parentComment: id });

    // Delete the comment
    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Like a comment
// @route   POST /api/comments/:id/like
// @access  Private
export const likeComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Add like
    await comment.addLike(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Comment liked successfully',
      data: {
        likesCount: comment.likesCount,
      },
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Unlike a comment
// @route   DELETE /api/comments/:id/like
// @access  Private
export const unlikeComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Remove like
    await comment.removeLike(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Comment unliked successfully',
      data: {
        likesCount: comment.likesCount,
      },
    });
  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error unliking comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};
