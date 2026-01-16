import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import followRoutes from './routes/followRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import termsRoutes from './routes/termsRoutes.js';
import programRoutes from './routes/programRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { handleUploadError } from './config/upload.js';
import {
  generalLimiter,
  strictAuthLimiter,
  postLimiter,
  commentRateLimiter,
  uploadLimiter,
  passwordResetLimiter,
  searchLimiter,
  slidingWindowLimiter,
  getRateLimitStatus
} from './middleware/rateLimitMiddleware.js';
import { checkMaintenanceMode, attachSettings } from './middleware/settingsMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }
}));

// CORS middleware - MUST be before rate limiting to handle preflight requests
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://admas-blog-frontend.onrender.com', // Add your Render frontend URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'X-Track-View']
}));

// Body parser middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Cookie parser
app.use(cookieParser());

// ==================== ADVANCED RATE LIMITING ====================

// Apply sliding window rate limiter for all API routes
app.use('/api/', slidingWindowLimiter);

// Specific rate limiters for different endpoints
app.use('/api/auth/login', strictAuthLimiter);
app.use('/api/auth/register', strictAuthLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);
// Only apply post creation limiter to POST requests, not GET requests for reading posts
app.post('/api/posts', postLimiter);
app.use('/api/comments', commentRateLimiter);
app.use('/api/users/upload', uploadLimiter);
app.use('/api/posts/search', searchLimiter);

// Rate limit status endpoint
app.get('/api/rate-limit/status', getRateLimitStatus);

// ==================== SYSTEM SETTINGS MIDDLEWARE ====================
// Attach settings to all requests
app.use('/api/', attachSettings);

// Check maintenance mode for all API routes (except health and admin)
app.use('/api/', checkMaintenanceMode);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip} - User: ${req.user?.id || 'Anonymous'}`);
  next();
});

// Health check route with detailed information
app.get('/api/health', (req, res) => {
  const healthInfo = {
    success: true,
    message: 'Admas University Blog API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'Connected', // You can add DB connection check here
    services: {
      email: process.env.SMTP_HOST ? 'Configured' : 'Not Configured',
      storage: process.env.CLOUDINARY_CLOUD_NAME ? 'Cloudinary' : 'Local'
    }
  };

  res.status(200).json(healthInfo);
});

// API documentation route
app.get('/api/docs', (req, res) => {
  const docs = {
    message: 'Admas University Blog API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/verify-email': 'Verify email address',
        'POST /api/auth/forgot-password': 'Request password reset',
        'PUT /api/auth/reset-password': 'Reset password',
        'POST /api/auth/refresh-token': 'Refresh access token',
        'GET /api/auth/logout': 'Logout user',
        'POST /api/auth/resend-verification': 'Resend verification email'
      },
      admin: {
        'GET /api/admin/pending-users': 'Get pending users (Admin only)',
        'GET /api/admin/users': 'Get all users (Admin only)',
        'GET /api/admin/stats': 'Get user statistics (Admin only)',
        'PUT /api/admin/users/:id/approve': 'Approve user (Admin only)',
        'PUT /api/admin/users/:id/reject': 'Reject user (Admin only)',
        'PUT /api/admin/users/:id/roles': 'Update user roles (Admin only)',
        'PUT /api/admin/users/:id/suspend': 'Suspend user (Admin only)',
        'PUT /api/admin/users/:id/activate': 'Activate user (Admin only)'
      },
      users: {
        'GET /api/users/profile': 'Get user profile (Protected)',
        'PUT /api/users/profile': 'Update user profile (Protected)',
        'PUT /api/users/change-password': 'Change password (Protected)',
        'POST /api/users/upload-avatar': 'Upload avatar (Protected)',
        'GET /api/users/posts': 'Get user posts (Protected)',
        'GET /api/users/activity': 'Get user activity (Protected)',
        'DELETE /api/users/account': 'Delete account (Protected)',
        'POST /api/users/:userId/follow': 'Follow a user (Protected)',
        'DELETE /api/users/:userId/follow': 'Unfollow a user (Protected)',
        'GET /api/users/:userId/follow/status': 'Get follow status (Protected)',
        'GET /api/users/:userId/followers': 'Get user followers (Public)',
        'GET /api/users/:userId/following': 'Get users being followed (Public)'
      },
      ai: {
        'POST /api/ai/keywords': 'Generate keyword suggestions for blog post',
        'POST /api/ai/analyze': 'Analyze content quality and appropriateness',
        'POST /api/ai/moderate': 'Check content for harmful material',
        'POST /api/ai/excerpt': 'Generate excerpt/summary for content',
        'POST /api/ai/spam-check': 'Check content for spam patterns',
        'POST /api/ai/report': 'Report inappropriate content to moderators',
        'POST /api/ai/filter': 'Filter/sanitize harmful content',
        'GET /api/ai/status': 'Check AI service status (Admin only)'
      }
    },
    authentication: 'Use JWT Bearer token in Authorization header',
    rate_limits: {
      general: '100 requests per minute (sliding window)',
      auth: '5 requests per 15 minutes for login/register',
      posts: '10 posts per hour',
      comments: '30 comments per hour',
      ai: '20 AI requests per hour',
      uploads: '50 uploads per hour',
      password_reset: '3 requests per hour',
      search: '30 searches per minute'
    }
  };

  res.status(200).json(docs);
});

// Root route - Welcome message
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Admas University Blog API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/health',
    status: 'Server is running'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', followRoutes); // Follow routes
app.use('/api/feed', feedRoutes); // Feed routes
app.use('/api', commentRoutes); // Comment routes
app.use('/api/newsletter', newsletterRoutes); // Newsletter routes
app.use('/api/contact', contactRoutes); // Contact form routes
app.use('/api/collaborations', collaborationRoutes); // Collaboration routes
app.use('/api/ai', aiRoutes); // AI-powered features (keywords, moderation, etc.)
app.use('/api/public', publicRoutes); // Public stats and featured content
app.use('/api/documents', documentRoutes); // Document upload and retrieval
app.use('/api/admin/verifications', verificationRoutes); // Alumni verification management
app.use('/api/terms', termsRoutes); // Terms of Service, Privacy Policy, Content Guidelines
app.use('/api/programs', programRoutes); // Academic Programs management
app.use('/api/reviews', reviewRoutes); // Peer review routes

// Upload error handling
app.use(handleUploadError);

// Handle undefined routes
app.use('*', notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;