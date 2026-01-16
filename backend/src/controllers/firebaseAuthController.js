import admin from 'firebase-admin';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js';
import { formatUserResponse } from '../utils/helpers.js';
import AuditLogService from '../services/auditLogService.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

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

// @desc    Google Login
// @route   POST /api/auth/firebase/google-login
// @access  Public
export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: 'ID token is required'
    });
  }

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Check if user is approved and email verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    if (user.status !== 'approved' && user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. You will be notified once approved.'
      });
    }

    // Update Firebase UID if not already set
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log successful login
    await AuditLogService.logUserLogin(user._id, req);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired ID token'
    });
  }
});

// @desc    Google Register
// @route   POST /api/auth/firebase/google-register
// @access  Public
export const googleRegister = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    accountType, // reader or author
    roleApplication,
    universityId,
    department,
    yearOfStudy,
    position,
    graduationYear,
    verificationDocument,
    firebaseUid,
    idToken
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !roleApplication || !universityId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  try {
    // Verify Firebase ID token
    if (idToken) {
      await admin.auth().verifyIdToken(idToken);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { universityId }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or university ID already exists'
      });
    }

    // Generate a random password for Google users (they won't use it)
    const randomPassword = Math.random().toString(36).slice(-12) + 'Aa1!';

    // Determine roles - FORCE 'reader' initially
    // If accountType is 'author', it becomes a pending application
    const userRole = 'reader';
    const authorStatus = accountType === 'author' ? 'pending' : 'none';

    // Determine basic status - Google users are email verified
    // But Alumni still need manual verification
    let userStatus = 'approved';
    let userIsActive = true;

    if (roleApplication === 'alumni') {
      userStatus = 'pending';
      userIsActive = false;
    }

    // Create user with Firebase UID
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: randomPassword, // Generate random password for Google users
      roleApplication,
      universityId,
      department,
      yearOfStudy,
      position,
      graduationYear,
      verificationDocument,
      firebaseUid,

      // Account Status
      status: userStatus,
      isActive: userIsActive,
      isEmailVerified: true, // Auto-verify email for Google users

      // Roles
      role: userRole,
      roles: [userRole],

      // Author Application
      authorApplicationStatus: authorStatus,
      authorApplicationDate: authorStatus === 'pending' ? new Date() : undefined,

      profile: {
        avatar: null,
        bio: '',
        contactInfo: {},
        socialMedia: {}
      }
    });

    // Log registration
    await AuditLogService.logUserRegistration(user._id, req);

    // Send notification email to admin
    try {
      // 1. Send Email
      await sendEmail({
        email: process.env.EMAIL_FROM,
        subject: 'New User Registration - Admas University Blog',
        template: 'admin-new-registration',
        data: {
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          userRole: user.roleApplication,
          accountType: accountType || 'reader',
          universityId: user.universityId,
          registrationDate: new Date().toLocaleDateString()
        }
      });

      // 2. Send In-App Notification (Socket + DB)
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
      console.error('Failed to send admin notifications:', notifError);
      // Don't fail registration if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is ready to use. You can now login with Google.',
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Google registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});
