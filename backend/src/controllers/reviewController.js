import BlogPost from '../models/blogpost/index.js';
import Notification from '../models/Notification.js';
import AuditLogService from '../services/auditLogService.js';

/**
 * @desc    Submit a peer review for a post
 * @route   POST /api/posts/:postId/reviews
 * @access  Private (Collaborators only)
 */
export const submitReview = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, status } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Review content is required' });
        }

        const post = await BlogPost.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Check if user is the author or a co-author
        const userId = req.user._id.toString();
        const isAuthor = post.author.toString() === userId;
        const isCoAuthor = post.coAuthors?.some(ca => ca.user.toString() === userId);

        if (!isAuthor && !isCoAuthor && req.user.role !== 'admin' && !req.user.roles?.includes('admin')) {
            return res.status(403).json({ success: false, message: 'Only collaborators can review this post' });
        }

        // Add review
        post.reviews.push({
            reviewer: req.user._id,
            content,
            status: status || 'comment_only'
        });

        // Update post status if it's an approval or changes requested
        if (status === 'approved' && post.status === 'under_review') {
            // We don't automatically publish, but we could mark as 'approved' (moderation-ready)
            // post.status = 'approved'; 
        } else if (status === 'changes_requested') {
            post.status = 'draft'; // Move back to draft for edits
        }

        await post.save();

        // Notify the author
        if (!isAuthor) {
            await Notification.create({
                recipient: post.author,
                sender: req.user._id,
                type: 'post_reviewed',
                title: 'New Peer Review',
                message: `${req.user.firstName || req.user.email} submitted a review for "${post.title}": ${status}`,
                link: `/posts/${post.slug || post._id}/edit`
            });
        }

        // Log action
        await AuditLogService.logPostReview(postId, req.user._id, status, req);

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review: post.reviews[post.reviews.length - 1]
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ success: false, message: 'Error submitting review' });
    }
};

/**
 * @desc    Get reviews for a post
 * @route   GET /api/posts/:postId/reviews
 * @access  Private (Collaborators only)
 */
export const getReviews = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await BlogPost.findById(postId)
            .populate('reviews.reviewer', 'firstName lastName email profile');

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        res.status(200).json({
            success: true,
            reviews: post.reviews || []
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Error fetching reviews' });
    }
};

/**
 * @desc    Request a peer review (sets status to under_review)
 * @route   POST /api/posts/:postId/request-review
 * @access  Private (Author only)
 */
export const requestReview = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await BlogPost.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the author can request a review' });
        }

        post.status = 'under_review';
        await post.save();

        // Notify all co-authors who are reviewers or editors
        const collaborators = post.coAuthors?.filter(ca => ca.role === 'reviewer' || ca.role === 'editor') || [];

        for (const ca of collaborators) {
            await Notification.create({
                recipient: ca.user,
                sender: req.user._id,
                type: 'review_requested',
                title: 'Review Requested',
                message: `${req.user.firstName || req.user.email} requested a review for "${post.title}"`,
                link: `/posts/${post.slug || post._id}/edit`
            });
        }

        // Log action
        await AuditLogService.logReviewRequest(postId, req.user._id, req);

        res.status(200).json({
            success: true,
            message: 'Post status updated to under_review',
            status: post.status
        });
    } catch (error) {
        console.error('Error requesting review:', error);
        res.status(500).json({ success: false, message: 'Error requesting review' });
    }
};
