import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Terms from '../models/Terms.js';
import { sendEmail } from '../utils/email.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js';
import { formatUserResponse } from '../utils/helpers.js';
import AuditLogService from '../services/auditLogService.js';
import NotificationService from '../services/notificationService.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { generateId } from '../services/idService.js';
import { getInitialVerificationStatus, VERIFICATION_STATUS } from '../services/verificationService.js';

/**
 * Send token response with cookies
 */
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      accessToken,
      refreshToken,
      user: formatUserResponse(user)
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    accountType,
    roleApplication,
    universityId, // User-entered ID like "ADMS 5020/14"
    department,
    yearOfStudy,
    position,
    graduationYear,
    verificationDocumentId, // Document ID if alumni uploaded a document
    termsAccepted // Flag indicating terms were accepted
  } = req.body;

  // Determine user role based on accountType selection
  // Users can register directly as author or reader - no approval needed
  console.log('Register request body:', req.body);
  const userRole = accountType === 'author' ? 'author' : 'reader';
  const authorStatus = accountType === 'author' ? 'pending' : 'none';
  console.log(`Processing registration: email=${email}, accountType=${accountType}, authorStatus=${authorStatus}`);

  // Validate university ID format based on affiliation
  const prefixMap = {
    student: 'ADMS',
    faculty: 'ADMF',
    staff: 'ADMT',
    alumni: 'ADME'
  };

  if (universityId && roleApplication) {
    const expectedPrefix = prefixMap[roleApplication];
    // Pattern: PREFIX XXXX/YY (with optional space, 4 digits, slash, 2 digits)
    const pattern = new RegExp(`^${expectedPrefix}\\s?\\d{4}/\\d{2}$`, 'i');
    if (!pattern.test(universityId.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid university ID format. Expected: ${expectedPrefix} XXXX/YY (e.g., ${expectedPrefix} 5020/14)`
      });
    }
  }

  // Normalize the university ID (remove extra spaces, uppercase prefix)
  const normalizedId = universityId ? universityId.trim().toUpperCase().replace(/\s+/g, ' ') : null;

  // Check if user exists by email or university ID
  const existingUser = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      ...(normalizedId ? [{ universityId: normalizedId }] : [])
    ]
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login or use a different email.'
      });
    }
    if (normalizedId && existingUser.universityId === normalizedId) {
      return res.status(400).json({
        success: false,
        message: 'This university ID is already registered. Please check your ID or contact support.'
      });
    }
  }

  // Determine verification status based on affiliation
  const verificationStatus = getInitialVerificationStatus(roleApplication);

  // Prepare verification document data for alumni
  let verificationDocument = null;
  if (roleApplication === 'alumni' && verificationDocumentId) {
    verificationDocument = {
      documentId: verificationDocumentId,
      uploadedAt: new Date()
    };
  }

  // Create user with user-entered university ID
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    roleApplication,
    universityId: normalizedId,
    department,
    yearOfStudy,
    position,
    graduationYear,
    verificationStatus,
    verificationDocument,
    status: roleApplication === 'alumni' ? 'pending' : 'pending',
    role: userRole,
    roles: [userRole],
    isEmailVerified: false,
    isActive: roleApplication !== 'alumni', // Alumni need verification first

    // Author Application
    authorApplicationStatus: authorStatus,
    authorApplicationDate: authorStatus === 'pending' ? new Date() : undefined
  });

  // Record terms acceptance if provided
  if (termsAccepted) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'];

      // Get current versions of ToS and Privacy Policy
      const [tosTerms, privacyTerms] = await Promise.all([
        Terms.getCurrentByType('tos'),
        Terms.getCurrentByType('privacy')
      ]);

      const acceptances = [];
      if (tosTerms) {
        acceptances.push({
          type: 'tos',
          version: tosTerms.version,
          acceptedAt: new Date(),
          ipAddress
        });
      }
      if (privacyTerms) {
        acceptances.push({
          type: 'privacy',
          version: privacyTerms.version,
          acceptedAt: new Date(),
          ipAddress
        });
      }

      if (acceptances.length > 0) {
        user.termsAcceptances = acceptances;
        await user.save({ validateBeforeSave: false });
      }
    } catch (termsError) {
      console.error('Error recording terms acceptance:', termsError);
      // Don't fail registration if terms recording fails
    }
  }

  // Generate email verification token
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - Admas University Blog',
      template: 'email-verification',
      data: {
        name: user.firstName,
        verificationUrl,
        verificationToken
      }
    });

    await AuditLogService.logUserRegistration(user._id, req);

    // Notify admins about new user registration (especially for alumni)
    try {
      const admins = await User.find({
        $or: [
          { role: 'admin' },
          { roles: { $in: ['admin'] } }
        ]
      }).select('_id');

      if (admins.length > 0) {
        const adminIds = admins.map(a => a._id);
        await NotificationService.notifyAdminNewUser(adminIds, user);
      }
    } catch (notifError) {
      console.error('Error notifying admins:', notifError);
    }

    // Prepare response message based on affiliation
    let message = 'Registration successful! Please check your email for verification instructions.';
    if (roleApplication === 'alumni') {
      message = 'Registration successful! Please verify your email. Your account will be activated after admin reviews your graduation certificate.';
    } else if (universityId) {
      message = `Registration successful! Your university ID is ${universityId}. Please check your email for verification.`;
    }

    if (authorStatus === 'pending' && roleApplication !== 'alumni') {
      message += " Your request to become an Author is pending approval.";
    }

    res.status(201).json({
      success: true,
      message,
      user: formatUserResponse(user),
      universityId
    });
  } catch (emailError) {
    console.error('Email sending error:', emailError);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Registration completed but verification email could not be sent. Please contact support.'
    });
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token. Please request a new verification email.'
    });
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  // For alumni, keep pending status until document verification
  // For others, auto-approve after email verification
  if (user.roleApplication === 'alumni') {
    user.status = 'pending'; // Still pending document verification
    // isActive remains false until admin approves
  } else {
    user.status = 'approved';
    user.isActive = true;
    user.verificationStatus = VERIFICATION_STATUS.NOT_REQUIRED;
  }

  await user.save();

  await AuditLogService.logEmailVerification(user._id, req);

  // Different message for alumni
  let message = 'Email verified successfully! Your account is now active. You can log in now.';
  if (user.roleApplication === 'alumni') {
    message = 'Email verified successfully! Your account is pending admin verification of your graduation certificate. You will be notified once approved.';
  } else if (user.authorApplicationStatus === 'pending') {
    // Notify admin about new author request (after email verification)
    try {
      const admins = await User.find({
        $or: [
          { role: 'admin' },
          { roles: { $in: ['admin'] } }
        ]
      }).select('_id');

      if (admins.length > 0) {
        const adminIds = admins.map(a => a._id);
        await NotificationService.notifyAdminAuthorRequest(adminIds, user);
      }
    } catch (err) {
      console.error('Error sending author request notification:', err);
    }

    message = 'Email verified! Your account is active as a Reader. Your Author application is pending approval.';
  }

  res.status(200).json({
    success: true,
    message,
    requiresVerification: user.roleApplication === 'alumni'
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Check for user with password (support both old and new field names)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No account found with this email address. Please check your email or sign up.'
    });
  }

  // Check if password matches
  const isMatch = await user.correctPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password. Please try again.'
    });
  }

  // Check if user is active (support both old status field and new isActive field)
  const isUserActive = user.isActive !== false && (!user.status || ['approved', 'active'].includes(user.status));

  if (!isUserActive) {
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval.'
      });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account registration was rejected.'
      });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Your account is not active. Please contact support.'
    });
  }

  // Log successful login
  await AuditLogService.logUserLogin(user._id, req);

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // Log logout action
  if (req.user) {
    await AuditLogService.logUserLogout(req.user._id, req);
  }

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user: formatUserResponse(user)
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal whether email exists
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  user.emailVerificationToken = resetToken;
  user.emailVerificationExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - Admas University Blog',
      template: 'password-reset',
      data: {
        name: user.firstName || user.username,
        resetUrl,
        resetToken
      }
    });

    // Log password reset request
    await AuditLogService.logPasswordResetRequest(user._id, req);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Email sending error:', error);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent. Please try again later.'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token. Please request a new password reset.'
    });
  }

  // Set new password (support both old and new field names)
  if (user.passwordHash !== undefined) {
    user.passwordHash = password;
  } else {
    user.password = password;
  }
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  // Log password reset
  await AuditLogService.logPasswordReset(user._id, req);

  res.status(200).json({
    success: true,
    message: 'Password reset successful! You can now log in with your new password.'
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'No refresh token provided'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account not eligible for token refresh'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const {
    username,
    firstName,
    lastName,
    bio,
    contactInfo,
    socialMedia,
    preferences
  } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if username is already taken (if provided and different from current)
  if (username && username !== user.username) {
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken. Please choose a different one.'
      });
    }
    // Username will be automatically converted to lowercase by the schema
    user.username = username.toLowerCase();
  }

  // Update basic info
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;

  // Update profile fields
  if (bio !== undefined) {
    if (!user.profile) user.profile = {};
    user.profile.bio = bio;
  }

  if (contactInfo) {
    if (!user.profile) user.profile = {};
    if (!user.profile.contactInfo) user.profile.contactInfo = {};
    if (contactInfo.phone !== undefined) user.profile.contactInfo.phone = contactInfo.phone;
    if (contactInfo.website !== undefined) user.profile.contactInfo.website = contactInfo.website;
  }

  if (socialMedia) {
    if (!user.profile) user.profile = {};
    if (!user.profile.socialMedia) user.profile.socialMedia = {};
    if (socialMedia.twitter !== undefined) user.profile.socialMedia.twitter = socialMedia.twitter;
    if (socialMedia.linkedin !== undefined) user.profile.socialMedia.linkedin = socialMedia.linkedin;
    if (socialMedia.github !== undefined) user.profile.socialMedia.github = socialMedia.github;
  }

  // Update preferences
  if (preferences) {
    if (!user.preferences) user.preferences = {};
    user.preferences = { ...user.preferences, ...preferences };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: formatUserResponse(user)
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+passwordHash');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check current password
  const isCurrentPasswordValid = await user.correctPassword(currentPassword);

  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Check if new password is same as current
  const isSamePassword = await user.correctPassword(newPassword);

  if (isSamePassword) {
    return res.status(400).json({
      success: false,
      message: 'New password must be different from current password'
    });
  }

  // Update password
  user.passwordHash = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal whether email exists
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a verification email has been sent.'
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified. You can log in now.'
    });
  }

  // Generate new verification token
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - Admas University Blog',
      template: 'email-verification',
      data: {
        name: user.firstName,
        verificationUrl,
        verificationToken
      }
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully! Please check your inbox.'
    });
  } catch (error) {
    console.error('Email sending error:', error);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent. Please try again later.'
    });
  }
});