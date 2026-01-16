import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { sendEmail } from '../utils/email.js';
import { formatUserResponse, getPaginationParams, formatPaginatedResponse } from '../utils/helpers.js';
import AuditLogService from '../services/auditLogService.js';
import { validateUserForApproval } from '../services/userValidationService.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { clearSettingsCache } from '../middleware/settingsMiddleware.js';

// @desc    Get all pending users
// @route   GET /api/admin/pending-users
// @access  Private/Admin
export const getPendingUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);

  const [users, total] = await Promise.all([
    User.find({ status: 'pending', isEmailVerified: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({ status: 'pending', isEmailVerified: true })
  ]);

  res.status(200).json({
    success: true,
    ...formatPaginatedResponse(users.map(formatUserResponse), total, page, limit)
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);
  const { status, roleApplication, search } = req.query;

  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (roleApplication) filter.roleApplication = roleApplication;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { universityId: { $regex: search, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    ...formatPaginatedResponse(users.map(formatUserResponse), total, page, limit)
  });
});

// @desc    Get user statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $facet: {
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        roleApplicationCounts: [
          {
            $group: {
              _id: '$roleApplication',
              count: { $sum: 1 }
            }
          }
        ],
        emailVerificationCounts: [
          {
            $group: {
              _id: '$isEmailVerified',
              count: { $sum: 1 }
            }
          }
        ],
        totalUsers: [
          {
            $count: 'count'
          }
        ],
        recentRegistrations: [
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]
      }
    }
  ]);

  const formattedStats = {
    total: stats[0].totalUsers[0]?.count || 0,
    byStatus: stats[0].statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    byRoleApplication: stats[0].roleApplicationCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    emailVerified: stats[0].emailVerificationCounts.find(s => s._id === true)?.count || 0,
    emailNotVerified: stats[0].emailVerificationCounts.find(s => s._id === false)?.count || 0,
    recentRegistrations: stats[0].recentRegistrations
  };

  res.status(200).json({
    success: true,
    stats: formattedStats
  });
});

// @desc    Approve user
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
export const approveUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roles, reviewNotes } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Allow approving both pending and rejected users
  if (user.status !== 'pending' && user.status !== 'rejected') {
    return res.status(400).json({
      success: false,
      message: 'User cannot be approved from current status'
    });
  }

  if (!user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Cannot approve user with unverified email'
    });
  }

  // Validate user before approval
  const validation = await validateUserForApproval(user);
  if (!validation.canApprove) {
    return res.status(400).json({
      success: false,
      message: 'User does not meet approval criteria',
      validationErrors: validation.validationResults.filter(r => r.severity === 'error'),
      warnings: validation.warnings
    });
  }

  // Update user status and roles
  user.status = 'approved';
  user.roles = roles || ['author', 'reader'];
  user.reviewedBy = req.user.id;
  user.reviewNotes = reviewNotes;
  user.reviewedAt = new Date();

  await user.save();

  // Send approval email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Account Approved - Admas University Blog',
      template: 'account-approved',
      data: {
        name: user.firstName,
        loginUrl: `${process.env.CLIENT_URL}/login`
      }
    });
  } catch (emailError) {
    console.error('Approval email failed:', emailError);
  }

  // Log approval action
  await AuditLogService.logUserApproval(user._id, req.user.id, user.roles, req);

  res.status(200).json({
    success: true,
    message: 'User approved successfully',
    user: formatUserResponse(user)
  });
});

// @desc    Reject user
// @route   PUT /api/admin/users/:id/reject
// @access  Private/Admin
export const rejectUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reviewNotes } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'User is not pending approval'
    });
  }

  // Update user status
  user.status = 'rejected';
  user.reviewedBy = req.user.id;
  user.reviewNotes = reviewNotes;
  user.reviewedAt = new Date();

  await user.save();

  // Send rejection email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Account Review - Admas University Blog',
      template: 'account-rejected',
      data: {
        name: user.firstName,
        reviewNotes: reviewNotes || 'Your application did not meet the requirements for platform access.'
      }
    });
  } catch (emailError) {
    console.error('Rejection email failed:', emailError);
  }

  // Log rejection action
  await AuditLogService.logUserRejection(user._id, req.user.id, reviewNotes, req);

  res.status(200).json({
    success: true,
    message: 'User rejected successfully'
  });
});

// @desc    Update user roles
// @route   PUT /api/admin/users/:id/roles
// @access  Private/Admin
export const updateUserRoles = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roles } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Validate roles
  const validRoles = ['admin', 'moderator', 'author', 'reader'];
  const invalidRoles = roles.filter(role => !validRoles.includes(role));
  
  if (invalidRoles.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${validRoles.join(', ')}`
    });
  }

  // Prevent removing all roles
  if (roles.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'User must have at least one role'
    });
  }

  const oldRoles = [...user.roles];
  user.roles = roles;
  await user.save();

  // Log role update
  await AuditLogService.logAction(
    'role_updated',
    'user',
    user._id,
    req.user.id,
    {
      oldRoles,
      newRoles: roles,
      description: `User roles updated from [${oldRoles.join(', ')}] to [${roles.join(', ')}]`
    },
    req
  );

  res.status(200).json({
    success: true,
    message: 'User roles updated successfully',
    user: formatUserResponse(user)
  });
});

// @desc    Suspend user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
export const suspendUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reviewNotes } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.status === 'suspended') {
    return res.status(400).json({
      success: false,
      message: 'User is already suspended'
    });
  }

  const oldStatus = user.status;
  user.status = 'suspended';
  user.reviewedBy = req.user.id;
  user.reviewNotes = reviewNotes;
  user.reviewedAt = new Date();

  await user.save();

  // Log suspension
  await AuditLogService.logAction(
    'user_suspended',
    'user',
    user._id,
    req.user.id,
    {
      oldStatus,
      reason: reviewNotes,
      description: `User suspended. Previous status: ${oldStatus}`
    },
    req
  );

  res.status(200).json({
    success: true,
    message: 'User suspended successfully'
  });
});

// @desc    Activate user
// @route   PUT /api/admin/users/:id/activate
// @access  Private/Admin
export const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.status === 'active') {
    return res.status(400).json({
      success: false,
      message: 'User is already active'
    });
  }

  const oldStatus = user.status;
  user.status = 'active';
  await user.save();

  // Log activation
  await AuditLogService.logAction(
    'user_activated',
    'user',
    user._id,
    req.user.id,
    {
      oldStatus,
      description: `User activated. Previous status: ${oldStatus}`
    },
    req
  );

  res.status(200).json({
    success: true,
    message: 'User activated successfully',
    user: formatUserResponse(user)
  });
});

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user's recent activity
  const recentActivity = await AuditLogService.getUserActivity(id, 10);

  res.status(200).json({
    success: true,
    user: formatUserResponse(user),
    recentActivity
  });
});

// @desc    Bulk approve users
// @route   POST /api/admin/users/bulk-approve
// @access  Private/Admin
export const bulkApproveUsers = asyncHandler(async (req, res) => {
  const { userIds, roles } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'User IDs array is required'
    });
  }

  const result = await User.updateMany(
    {
      _id: { $in: userIds },
      status: 'pending',
      isEmailVerified: true
    },
    {
      $set: {
        status: 'approved',
        roles: roles || ['author', 'reader'],
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      }
    }
  );

  // Send approval emails and log actions
  const approvedUsers = await User.find({ _id: { $in: userIds }, status: 'approved' });
  
  for (const user of approvedUsers) {
    try {
      await sendEmail({
        email: user.email,
        subject: 'Account Approved - Admas University Blog',
        template: 'account-approved',
        data: {
          name: user.firstName,
          loginUrl: `${process.env.CLIENT_URL}/login`
        }
      });
    } catch (emailError) {
      console.error(`Approval email failed for ${user.email}:`, emailError);
    }

    await AuditLogService.logUserApproval(user._id, req.user.id, user.roles, req);
  }

  res.status(200).json({
    success: true,
    message: `Successfully approved ${result.modifiedCount} users`,
    approvedCount: result.modifiedCount
  });
});


// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Only allow deleting rejected or pending users
  if (user.status !== 'rejected' && user.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Can only delete rejected or pending users'
    });
  }

  // Delete the user
  await User.findByIdAndDelete(id);

  // Log deletion action
  await AuditLogService.logUserDeletion(id, req.user.id, req);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});


// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, action, resourceType, userId, startDate, endDate, search } = req.query;

  // Build query filter
  const query = {};
  
  if (action) query.action = action;
  if (resourceType) query.resourceType = resourceType;
  if (userId) query.performedBy = userId;
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  if (search) {
    query.$or = [
      { action: { $regex: search, $options: 'i' } },
      { 'metadata.description': { $regex: search, $options: 'i' } },
      { ipAddress: { $regex: search, $options: 'i' } }
    ];
  }

  const result = await AuditLogService.searchLogs(query, parseInt(page), parseInt(limit));

  res.status(200).json({
    success: true,
    ...result
  });
});

// @desc    Get audit log statistics
// @route   GET /api/admin/audit-logs/stats
// @access  Private/Admin
export const getAuditLogStats = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const stats = await AuditLogService.getSystemStats(parseInt(days));

  res.status(200).json({
    success: true,
    stats
  });
});

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSystemSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  
  // Add runtime info
  const settingsResponse = {
    general: settings.general,
    moderation: settings.moderation,
    email: {
      ...settings.email.toObject(),
      smtpConfigured: settings.isSmtpConfigured()
    },
    security: settings.security,
    audit: settings.audit
  };

  res.status(200).json({
    success: true,
    settings: settingsResponse
  });
});

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSystemSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;

  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Settings object is required'
    });
  }

  // Update settings in database
  const updatedSettings = await Settings.updateSettings(settings, req.user.id);
  
  // Clear settings cache so changes take effect immediately
  clearSettingsCache();

  // Log settings update
  await AuditLogService.logAction(
    'settings_updated',
    'system',
    req.user.id,
    req.user.id,
    {
      description: 'System settings updated',
      updatedSettings: Object.keys(settings)
    },
    req
  );

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    settings: {
      general: updatedSettings.general,
      moderation: updatedSettings.moderation,
      email: {
        ...updatedSettings.email.toObject(),
        smtpConfigured: updatedSettings.isSmtpConfigured()
      },
      security: updatedSettings.security,
      audit: updatedSettings.audit
    }
  });
});
