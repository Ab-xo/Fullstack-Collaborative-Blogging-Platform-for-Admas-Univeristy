import mongoose from 'mongoose';
import User from '../models/User.js';
import BlogPost from '../models/BlogPost.js';
import { formatUserResponse } from '../utils/helpers.js';
import AuditLogService from '../services/auditLogService.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { uploadFile } from '../utils/uploadHelpers.js';

// =====================================
// Get user profile
// =====================================
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    user: formatUserResponse(user),
  });
});

// =====================================
// Update user profile
// =====================================
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, bio, contactInfo, socialMedia } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const updatedFields = {};

  if (firstName && firstName !== user.firstName) {
    user.firstName = firstName;
    updatedFields.firstName = true;
  }

  if (lastName && lastName !== user.lastName) {
    user.lastName = lastName;
    updatedFields.lastName = true;
  }

  if (bio !== undefined && bio !== user.profile.bio) {
    user.profile.bio = bio;
    updatedFields.bio = true;
  }

  if (contactInfo) {
    user.profile.contactInfo = { ...user.profile.contactInfo, ...contactInfo };
    updatedFields.contactInfo = true;
  }

  if (socialMedia) {
    user.profile.socialMedia = { ...user.profile.socialMedia, ...socialMedia };
    updatedFields.socialMedia = true;
  }

  await user.save();

  await AuditLogService.logProfileUpdate(user._id, updatedFields, req);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: formatUserResponse(user),
  });
});

// =====================================
// Change Password
// =====================================
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const isCurrentValid = await user.correctPassword(currentPassword, user.password);
  if (!isCurrentValid) {
    await AuditLogService.logFailedAction(
      'password_changed',
      'auth',
      user._id,
      user._id,
      new Error('Current password incorrect'),
      req
    );

    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  const isSame = await user.correctPassword(newPassword, user.password);
  if (isSame) {
    return res.status(400).json({
      success: false,
      message: 'New password must be different from current password',
    });
  }

  user.password = newPassword;
  await user.save();

  await AuditLogService.logPasswordChange(user._id, req);

  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

// =====================================
// Upload Avatar
// =====================================
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file' });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  try {
    const uploadResult = await uploadFile(req.file, 'avatar');

    user.profile.avatar = uploadResult.url;
    await user.save();

    await AuditLogService.logAvatarUpload(user._id, req);

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: uploadResult.url,
    });
  } catch (error) {
    await AuditLogService.logFailedAction(
      'avatar_uploaded',
      'profile',
      user._id,
      user._id,
      error,
      req
    );

    console.error('Avatar upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading avatar' });
  }
});

// =====================================
// GET USER POSTS
// =====================================
export const getUserPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const skip = (page - 1) * limit;
  const filter = { author: req.user.id };
  if (status) filter.status = status;

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .populate('author', 'firstName lastName profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    BlogPost.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    posts,
    pagination: {
      current: parseInt(page),
      total: Math.ceil(total / limit),
      count: posts.length,
      totalCount: total,
    },
  });
});

// =====================================
// Get User Activity
// =====================================
export const getUserActivity = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const activity = await AuditLogService.getUserActivity(req.user.id, parseInt(limit));

  res.status(200).json({ success: true, activity });
});

// =====================================
// Delete Account
// =====================================
export const deleteAccount = asyncHandler(async (req, res) => {
  const { confirmation } = req.body;

  if (confirmation !== 'DELETE_MY_ACCOUNT') {
    return res.status(400).json({
      success: false,
      message: 'Type DELETE_MY_ACCOUNT to confirm deletion',
    });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.status = 'suspended';
  user.email = `deleted_${user._id}@admas.edu.et`;
  user.universityId = `deleted_${user.universityId}`;
  await user.save();

  await AuditLogService.logAction(
    'account_deleted',
    'user',
    user._id,
    user._id,
    { description: 'User deleted account' },
    req
  );

  res.status(200).json({ success: true, message: 'Account deleted successfully' });
});

// =====================================
// Get Preferences
// =====================================
export const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Return user preferences with defaults
  const preferences = {
    // Account info
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    bio: user.profile?.bio || '',
    
    // Privacy settings
    profileVisibility: user.preferences?.profileVisibility || 'public',
    showEmail: user.preferences?.showEmail || false,
    showFollowers: user.preferences?.showFollowers !== false,
    allowComments: user.preferences?.allowComments !== false,
    
    // Notification preferences
    emailNotifications: user.preferences?.emailNotifications !== false,
    pushNotifications: user.preferences?.pushNotifications !== false,
    commentNotifications: user.preferences?.commentNotifications !== false,
    likeNotifications: user.preferences?.likeNotifications !== false,
    followNotifications: user.preferences?.followNotifications !== false,
    collaborationNotifications: user.preferences?.collaborationNotifications !== false,
    
    // Writing preferences
    defaultPostStatus: user.preferences?.defaultPostStatus || 'draft',
    autoSave: user.preferences?.autoSave !== false,
    editorTheme: user.preferences?.editorTheme || 'light',
    showWordCount: user.preferences?.showWordCount !== false,
    
    // Display preferences
    theme: user.preferences?.theme || 'system',
    language: user.preferences?.language || 'en',
    timezone: user.preferences?.timezone || 'UTC',
    
    // Social links
    socialLinks: {
      twitter: user.profile?.socialMedia?.twitter || '',
      linkedin: user.profile?.socialMedia?.linkedin || '',
      github: user.profile?.socialMedia?.github || '',
      website: user.profile?.socialMedia?.website || ''
    }
  };

  res.status(200).json({
    success: true,
    preferences
  });
});

// =====================================
// Update Preferences
// =====================================
export const updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (!user.preferences) user.preferences = {};
  if (!user.profile) user.profile = {};
  if (!user.profile.socialMedia) user.profile.socialMedia = {};

  const {
    // Account info
    firstName,
    lastName,
    bio,
    
    // Privacy settings
    profileVisibility,
    showEmail,
    showFollowers,
    allowComments,
    
    // Notification preferences
    emailNotifications,
    pushNotifications,
    commentNotifications,
    likeNotifications,
    followNotifications,
    collaborationNotifications,
    
    // Writing preferences
    defaultPostStatus,
    autoSave,
    editorTheme,
    showWordCount,
    
    // Display preferences
    theme,
    language,
    timezone,
    
    // Social links
    socialLinks
  } = req.body;

  // Update account info
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (bio !== undefined) user.profile.bio = bio;

  // Update privacy settings
  if (profileVisibility !== undefined) user.preferences.profileVisibility = profileVisibility;
  if (showEmail !== undefined) user.preferences.showEmail = showEmail;
  if (showFollowers !== undefined) user.preferences.showFollowers = showFollowers;
  if (allowComments !== undefined) user.preferences.allowComments = allowComments;

  // Update notification preferences
  if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;
  if (pushNotifications !== undefined) user.preferences.pushNotifications = pushNotifications;
  if (commentNotifications !== undefined) user.preferences.commentNotifications = commentNotifications;
  if (likeNotifications !== undefined) user.preferences.likeNotifications = likeNotifications;
  if (followNotifications !== undefined) user.preferences.followNotifications = followNotifications;
  if (collaborationNotifications !== undefined) user.preferences.collaborationNotifications = collaborationNotifications;

  // Update writing preferences
  if (defaultPostStatus !== undefined) user.preferences.defaultPostStatus = defaultPostStatus;
  if (autoSave !== undefined) user.preferences.autoSave = autoSave;
  if (editorTheme !== undefined) user.preferences.editorTheme = editorTheme;
  if (showWordCount !== undefined) user.preferences.showWordCount = showWordCount;

  // Update display preferences
  if (theme !== undefined) user.preferences.theme = theme;
  if (language !== undefined) user.preferences.language = language;
  if (timezone !== undefined) user.preferences.timezone = timezone;

  // Update social links
  if (socialLinks) {
    if (socialLinks.twitter !== undefined) user.profile.socialMedia.twitter = socialLinks.twitter;
    if (socialLinks.linkedin !== undefined) user.profile.socialMedia.linkedin = socialLinks.linkedin;
    if (socialLinks.github !== undefined) user.profile.socialMedia.github = socialLinks.github;
    if (socialLinks.website !== undefined) user.profile.socialMedia.website = socialLinks.website;
  }

  await user.save();

  await AuditLogService.logAction(
    'preferences_updated',
    'user',
    user._id,
    user._id,
    { description: 'User updated preferences' },
    req
  );

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    preferences: user.preferences,
  });
});

// =====================================
// Dashboard Stats
// =====================================
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [totalPosts, publishedPosts, draftPosts, pendingPosts, aggregateStats] =
    await Promise.all([
      BlogPost.countDocuments({ author: userObjectId }),
      BlogPost.countDocuments({ author: userObjectId, status: 'published' }),
      BlogPost.countDocuments({ author: userObjectId, status: 'draft' }),
      BlogPost.countDocuments({ author: userObjectId, status: 'pending' }),
      BlogPost.aggregate([
        { $match: { author: userObjectId } },
        { 
          $group: { 
            _id: null, 
            totalLikes: { $sum: { $ifNull: ['$likesCount', 0] } },
            totalDislikes: { $sum: { $ifNull: ['$dislikesCount', 0] } },
            totalViews: { $sum: { $ifNull: ['$views', 0] } },
            totalComments: { $sum: { $ifNull: ['$commentsCount', 0] } }
          } 
        },
      ]),
    ]);

  const stats = aggregateStats[0] || { totalLikes: 0, totalDislikes: 0, totalViews: 0, totalComments: 0 };

  res.status(200).json({
    success: true,
    stats: {
      postsCount: totalPosts,
      publishedCount: publishedPosts,
      draftCount: draftPosts,
      pendingCount: pendingPosts,
      totalLikes: stats.totalLikes,
      totalDislikes: stats.totalDislikes,
      totalViews: stats.totalViews,
      totalComments: stats.totalComments,
      // Also include old field names for backward compatibility
      totalPosts,
      publishedPosts,
      draftPosts,
      pendingPosts,
    },
  });
});

// =====================================
// Resend Verification Email
// =====================================
export const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.isEmailVerified)
    return res.status(400).json({ success: false, message: 'Email already verified' });

  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    const { sendEmail } = await import('../utils/email.js');
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - Admas University Blog',
      template: 'email-verification',
      data: {
        name: user.firstName,
        verificationUrl,
        verificationToken,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent',
    });
  }
});

// =====================================
// Role Application Update
// =====================================
export const updateRoleApplication = asyncHandler(async (req, res) => {
  const {
    roleApplication,
    department,
    yearOfStudy,
    position,
    graduationYear,
    verificationDocument,
  } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (user.status !== 'pending' && user.status !== 'rejected') {
    return res.status(400).json({
      success: false,
      message: 'Cannot change role application for approved users',
    });
  }

  if (roleApplication) user.roleApplication = roleApplication;
  if (department) user.department = department;
  if (yearOfStudy) user.yearOfStudy = yearOfStudy;
  if (position) user.position = position;
  if (graduationYear) user.graduationYear = graduationYear;
  if (verificationDocument) user.verificationDocument = verificationDocument;

  user.status = 'pending';
  user.reviewedBy = undefined;
  user.reviewNotes = undefined;
  user.reviewedAt = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Role application updated successfully and submitted for review',
    user: formatUserResponse(user),
  });
});
