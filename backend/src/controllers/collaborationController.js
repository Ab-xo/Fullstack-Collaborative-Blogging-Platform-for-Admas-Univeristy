/**
 * ============================================================================
 * COLLABORATION CONTROLLER
 * ============================================================================
 * Handles co-authoring, invitations, and revision history
 */

import BlogPost from '../models/blogpost/index.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import AuditLogService from '../services/auditLogService.js';

/**
 * @desc    Invite a user to collaborate on a post
 * @route   POST /api/posts/:postId/collaborators/invite
 * @access  Private (Author only)
 */
export const inviteCollaborator = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, role = 'contributor', message } = req.body;

    // Find the post
    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Get the author ID - handle both populated and non-populated cases
    const postAuthorId = post.author._id || post.author;
    const currentUserId = req.user._id || req.user.id;

    console.log('Invite collaborator check:', {
      postAuthorId: postAuthorId.toString(),
      currentUserId: currentUserId.toString(),
      match: postAuthorId.toString() === currentUserId.toString()
    });

    // Check if user is the author
    if (postAuthorId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the author can invite collaborators',
        debug: {
          postAuthor: postAuthorId.toString(),
          currentUser: currentUserId.toString()
        }
      });
    }

    // Check if user exists
    const invitedUser = await User.findById(userId);
    if (!invitedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is already a co-author
    const isCoAuthor = post.coAuthors?.some(ca => ca.user.toString() === userId);
    if (isCoAuthor) {
      return res.status(400).json({ success: false, message: 'User is already a collaborator' });
    }

    // Check if invitation already exists
    const existingInvite = post.collaborationInvites?.find(
      inv => inv.user.toString() === userId && inv.status === 'pending'
    );
    if (existingInvite) {
      return res.status(400).json({ success: false, message: 'Invitation already sent' });
    }

    // Can't invite yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot invite yourself' });
    }

    // Add invitation
    if (!post.collaborationInvites) post.collaborationInvites = [];
    post.collaborationInvites.push({
      user: userId,
      role,
      invitedBy: req.user._id,
      message,
      status: 'pending'
    });

    await post.save();

    // Send notification to invited user
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'collaboration_invite',
      title: 'Collaboration Invitation',
      message: `${req.user.firstName || req.user.email} invited you to collaborate on "${post.title}"`,
      link: `/posts/${post.slug || post._id}`,
      metadata: {
        postId: post._id,
        postTitle: post.title,
        role
      }
    });

    // Log action
    await AuditLogService.logCollaborationInvite(postId, req.user._id, userId, role, req);

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    res.status(500).json({ success: false, message: 'Error sending invitation' });
  }
};

/**
 * @desc    Respond to collaboration invitation
 * @route   POST /api/posts/:postId/collaborators/respond
 * @access  Private (Invited user only)
 */
export const respondToInvitation = async (req, res) => {
  try {
    const { postId } = req.params;
    const { accept } = req.body;

    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Find the invitation
    const inviteIndex = post.collaborationInvites?.findIndex(
      inv => inv.user.toString() === req.user._id.toString() && inv.status === 'pending'
    );

    if (inviteIndex === -1) {
      return res.status(404).json({ success: false, message: 'No pending invitation found' });
    }

    const invite = post.collaborationInvites[inviteIndex];

    if (accept) {
      // Add as co-author
      if (!post.coAuthors) post.coAuthors = [];
      post.coAuthors.push({
        user: req.user._id,
        role: invite.role,
        addedBy: invite.invitedBy
      });

      invite.status = 'accepted';

      // Notify the author
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'collaboration_accepted',
        title: 'Collaboration Accepted',
        message: `${req.user.firstName || req.user.email} accepted your invitation to collaborate on "${post.title}"`,
        link: `/posts/${post.slug || post._id}`
      });
    } else {
      invite.status = 'declined';

      // Notify the author
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'collaboration_declined',
        title: 'Collaboration Declined',
        message: `${req.user.firstName || req.user.email} declined your invitation to collaborate on "${post.title}"`,
        link: `/posts/${post.slug || post._id}`
      });
    }

    await post.save();

    // Log action
    await AuditLogService.logCollaborationResponse(postId, req.user._id, accept ? 'accepted' : 'declined', req);

    res.status(200).json({
      success: true,
      message: accept ? 'You are now a collaborator' : 'Invitation declined'
    });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({ success: false, message: 'Error processing response' });
  }
};

/**
 * @desc    Remove a collaborator from a post
 * @route   DELETE /api/posts/:postId/collaborators/:userId
 * @access  Private (Author only)
 */
export const removeCollaborator = async (req, res) => {
  try {
    const { postId, userId } = req.params;

    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the author can remove collaborators' });
    }

    // Remove co-author
    post.coAuthors = post.coAuthors?.filter(ca => ca.user.toString() !== userId) || [];
    await post.save();

    // Notify removed user
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'collaboration_removed',
      title: 'Removed from Collaboration',
      message: `You have been removed from collaborating on "${post.title}"`,
      link: `/posts/${post.slug || post._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Collaborator removed successfully'
    });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ success: false, message: 'Error removing collaborator' });
  }
};

/**
 * @desc    Get collaborators for a post
 * @route   GET /api/posts/:postId/collaborators
 * @access  Private
 */
export const getCollaborators = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await BlogPost.findById(postId)
      .populate('author', 'firstName lastName email profile')
      .populate('coAuthors.user', 'firstName lastName email profile')
      .populate('coAuthors.addedBy', 'firstName lastName')
      .populate('collaborationInvites.user', 'firstName lastName email profile');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        author: post.author,
        coAuthors: post.coAuthors || [],
        pendingInvites: post.collaborationInvites?.filter(inv => inv.status === 'pending') || []
      }
    });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ success: false, message: 'Error fetching collaborators' });
  }
};

/**
 * @desc    Get user's collaboration invitations
 * @route   GET /api/collaborations/invitations
 * @access  Private
 */
export const getMyInvitations = async (req, res) => {
  try {
    const posts = await BlogPost.find({
      'collaborationInvites.user': req.user._id,
      'collaborationInvites.status': 'pending'
    })
      .populate('author', 'firstName lastName email profile')
      .select('title slug author collaborationInvites featuredImage');

    const invitations = posts.map(post => {
      const invite = post.collaborationInvites.find(
        inv => inv.user.toString() === req.user._id.toString() && inv.status === 'pending'
      );
      return {
        postId: post._id,
        postTitle: post.title,
        postSlug: post.slug,
        featuredImage: post.featuredImage,
        author: post.author,
        role: invite.role,
        message: invite.message,
        invitedAt: invite.invitedAt
      };
    });

    res.status(200).json({
      success: true,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ success: false, message: 'Error fetching invitations' });
  }
};

/**
 * @desc    Get posts where user is a collaborator
 * @route   GET /api/collaborations/posts
 * @access  Private
 */
export const getCollaborativePosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({
      'coAuthors.user': req.user._id
    })
      .populate('author', 'firstName lastName email profile')
      .select('title slug author status featuredImage createdAt coAuthors');

    const collaborations = posts.map(post => {
      const myRole = post.coAuthors.find(
        ca => ca.user.toString() === req.user._id.toString()
      );
      return {
        ...post.toObject(),
        myRole: myRole?.role
      };
    });

    res.status(200).json({
      success: true,
      data: collaborations
    });
  } catch (error) {
    console.error('Error fetching collaborative posts:', error);
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
};

/**
 * @desc    Leave a collaboration
 * @route   POST /api/posts/:postId/collaborators/leave
 * @access  Private (Collaborator only)
 */
export const leaveCollaboration = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user is a collaborator
    const isCollaborator = post.coAuthors?.some(
      ca => ca.user.toString() === req.user._id.toString()
    );

    if (!isCollaborator) {
      return res.status(400).json({ success: false, message: 'You are not a collaborator on this post' });
    }

    // Remove self from co-authors
    post.coAuthors = post.coAuthors.filter(
      ca => ca.user.toString() !== req.user._id.toString()
    );
    await post.save();

    // Notify the author
    await Notification.create({
      recipient: post.author,
      sender: req.user._id,
      type: 'collaboration_left',
      title: 'Collaborator Left',
      message: `${req.user.firstName || req.user.email} left the collaboration on "${post.title}"`,
      link: `/posts/${post.slug || post._id}`
    });

    // Log action
    await AuditLogService.logCollaborationLeft(postId, req.user._id, req);

    res.status(200).json({
      success: true,
      message: 'You have left the collaboration'
    });
  } catch (error) {
    console.error('Error leaving collaboration:', error);
    res.status(500).json({ success: false, message: 'Error leaving collaboration' });
  }
};

/**
 * @desc    Search users to invite
 * @route   GET /api/collaborations/search-users
 * @access  Private
 */
export const searchUsersToInvite = async (req, res) => {
  try {
    const { q, postId } = req.query;

    console.log('Search users request:', { q, postId, userId: req.user._id });

    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get the post to exclude existing collaborators
    const post = postId ? await BlogPost.findById(postId) : null;
    const excludeIds = [req.user._id]; // Keep as ObjectId, not string

    if (post) {
      excludeIds.push(post.author);
      post.coAuthors?.forEach(ca => excludeIds.push(ca.user));
      post.collaborationInvites?.filter(inv => inv.status === 'pending')
        .forEach(inv => excludeIds.push(inv.user));
    }

    console.log('Excluded IDs:', excludeIds);

    // Build search query - make it more flexible
    const searchQuery = {
      _id: { $nin: excludeIds },
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };

    // Only add username search if field exists
    if (q) {
      searchQuery.$or.push({ username: { $regex: q, $options: 'i' } });
    }

    // Only filter by isActive if the field exists
    const sampleUser = await User.findOne().select('isActive').lean();
    if (sampleUser && 'isActive' in sampleUser) {
      searchQuery.isActive = true;
    }

    console.log('Search query:', JSON.stringify(searchQuery, null, 2));

    // Search users by name or email
    const users = await User.find(searchQuery)
      .select('firstName lastName email profile username')
      .limit(10)
      .lean();

    console.log('Found users:', users.length);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ success: false, message: 'Error searching users', error: error.message });
  }
};
