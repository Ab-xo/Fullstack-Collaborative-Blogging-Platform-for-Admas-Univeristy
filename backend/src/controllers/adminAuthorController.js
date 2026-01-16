import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';
import { sendEmail } from '../utils/email.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

// ==================== AUTHOR APPLICATION MANAGEMENT ====================

/**
 * @desc    Get all pending author applications
 * @route   GET /api/admin/pending-authors
 * @access  Private/Admin
 */
export const getPendingAuthors = asyncHandler(async (req, res) => {
    // Find users with pending author application status
    const users = await User.find({
        authorApplicationStatus: 'pending',
        isEmailVerified: true // Only show users who have verified their email
    }).sort({ authorApplicationDate: -1, createdAt: -1 }).select('-passwordHash -password');

    console.log(`getPendingAuthors found ${users.length} pending author applications`);

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

/**
 * @desc    Approve author application
 * @route   PUT /api/admin/authors/:id/approve
 * @access  Private/Admin
 */
export const approveAuthor = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.authorApplicationStatus !== 'pending') {
        res.status(400);
        throw new Error('User does not have a pending author application');
    }

    // Upgrade role to author
    user.authorApplicationStatus = 'approved';
    user.role = 'author';

    // Add to roles array if not present
    if (!user.roles || !user.roles.includes('author')) {
        user.roles = user.roles || [];
        user.roles.push('author');
    }

    await user.save();

    // Send approval email to user
    try {
        await sendEmail({
            email: user.email,
            subject: 'Author Application Approved - Admas University Blog',
            template: 'author-approved',
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                loginUrl: `${process.env.CLIENT_URL}/login`
            }
        });
        console.log(`Author approval email sent to ${user.email}`);
    } catch (emailError) {
        console.error('Failed to send author approval email:', emailError);
        // Don't fail the request if email fails
    }

    // Create in-app notification
    try {
        await NotificationService.createNotification({
            recipient: user._id,
            type: 'author_approved',
            title: 'Author Application Approved! 🎉',
            message: 'Congratulations! Your author application has been approved. You can now create and publish blog posts.',
            link: '/dashboard/posts/new'
        });
    } catch (notifError) {
        console.error('Failed to create approval notification:', notifError);
    }

    res.status(200).json({
        success: true,
        message: `User ${user.firstName} has been promoted to Author.`,
        data: user
    });
});

/**
 * @desc    Reject author application
 * @route   PUT /api/admin/authors/:id/reject
 * @access  Private/Admin
 */
export const rejectAuthor = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    const { reason } = req.body;

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.authorApplicationStatus !== 'pending') {
        res.status(400);
        throw new Error('User does not have a pending author application');
    }

    user.authorApplicationStatus = 'rejected';
    user.authorApplicationRejectionReason = reason || 'Your application did not meet our requirements at this time.';
    // Role remains 'reader'

    await user.save();

    // Send rejection email to user
    try {
        await sendEmail({
            email: user.email,
            subject: 'Author Application Update - Admas University Blog',
            template: 'author-rejected',
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                reason: user.authorApplicationRejectionReason,
                supportEmail: process.env.SUPPORT_EMAIL || 'support@admas.edu'
            }
        });
        console.log(`Author rejection email sent to ${user.email}`);
    } catch (emailError) {
        console.error('Failed to send author rejection email:', emailError);
    }

    // Create in-app notification
    try {
        await NotificationService.createNotification({
            recipient: user._id,
            type: 'author_rejected',
            title: 'Author Application Update',
            message: 'Your author application was not approved at this time. Please contact support for more information.',
            link: '/support'
        });
    } catch (notifError) {
        console.error('Failed to create rejection notification:', notifError);
    }

    res.status(200).json({
        success: true,
        message: 'Author application rejected.',
        data: user
    });
});
