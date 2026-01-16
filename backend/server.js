import { createServer } from 'http';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import { testEmail } from './src/utils/email.js';
import { initializeFirebase, isFirebaseConfigured } from './src/config/firebase.js';
import { initializeSocket, shutdownSocket } from './src/socket/index.js';
import socketService from './src/services/socketService.js';
import cacheService from './src/services/cacheService.js';

const PORT = process.env.PORT || 10000;

// Suppress mongoose duplicate index warning
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';
// Suppress duplicate index warnings in production
if (process.env.NODE_ENV === 'production') {
  process.env.NODE_NO_WARNINGS = '1';
}

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Check required environment variables silently
    const requiredVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      console.error(`❌ Missing required env vars: ${missingVars.join(', ')}`);
      process.exit(1);
    }
    
    // Connect to database (silently)
    await connectDB();
    
    // Initialize services silently
    let cacheStatus = '✓', firebaseStatus = '✓', cloudinaryStatus = '✓', socketStatus = '✓', emailStatus = '✓';
    
    // Cache
    try {
      await cacheService.connect();
    } catch (e) {
      cacheStatus = '✗';
    }
    
    // Email
    try {
      if (process.env.NODE_ENV !== 'test') await testEmail();
    } catch (e) {
      emailStatus = '✗';
    }

    // Firebase
    try {
      if (process.env.FIREBASE_PROJECT_ID) {
        initializeFirebase();
        if (!isFirebaseConfigured()) firebaseStatus = '✗';
      } else {
        firebaseStatus = '-';
      }
    } catch (e) {
      firebaseStatus = '✗';
    }

    // Cloudinary
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const cloudinary = await import('cloudinary');
        cloudinary.v2.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
      } else {
        cloudinaryStatus = '-';
      }
    } catch (e) {
      cloudinaryStatus = '✗';
    }

    // Start server
    const httpServer = createServer(app);
    
    // Socket.io
    try {
      const io = initializeSocket(httpServer);
      socketService.initialize(io);
    } catch (e) {
      socketStatus = '✗';
    }

    httpServer.listen(PORT, '0.0.0.0', () => {
      // Production-ready startup message
      if (process.env.NODE_ENV === 'production') {
        console.log(`✅ Admas Blog API Server running on port ${PORT}`);
        console.log(`✅ Environment: ${process.env.NODE_ENV}`);
        console.log(`✅ Services: DB:${cacheStatus} Cache:${cacheStatus} Firebase:${firebaseStatus} Cloud:${cloudinaryStatus} Socket:${socketStatus} Email:${emailStatus}`);
      } else {
        // Detailed message for development
        console.log('\n╔════════════════════════════════════════════════════╗');
        console.log('║       🚀 ADMAS BLOG API SERVER                     ║');
        console.log('╠════════════════════════════════════════════════════╣');
        console.log(`║  Port: ${PORT}  │  Mode: ${(process.env.NODE_ENV || 'development').padEnd(12)}            ║`);
        console.log('╠════════════════════════════════════════════════════╣');
        console.log(`║  DB: ${cacheStatus === '✓' ? '✓' : '✗'}  Cache: ${cacheStatus}  Firebase: ${firebaseStatus}  Cloud: ${cloudinaryStatus}  ║`);
        console.log(`║  Socket: ${socketStatus}  Email: ${emailStatus}                              ║`);
        console.log('╠════════════════════════════════════════════════════╣');
        console.log(`║  API: http://localhost:${PORT}/api                    ║`);
        console.log('╚════════════════════════════════════════════════════╝\n');
      }
    });

    // Store server reference for graceful shutdown
    const server = httpServer;

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received, starting graceful shutdown...`);
      
      // Close Socket.io connections first
      try {
        shutdownSocket();
        console.log('✅ Socket.io connections closed');
      } catch (error) {
        console.error('❌ Error closing Socket.io:', error);
      }
      
      // Close cache
      try {
        await cacheService.disconnect();
        console.log('✅ Cache cleared');
      } catch (error) {
        console.error('❌ Error clearing cache:', error);
      }
      
      server.close(async () => {
        console.log('✅ HTTP server closed');
        
        try {
          // Close database connection
          const mongoose = await import('mongoose');
          await mongoose.default.connection.close();
          console.log('✅ Database connection closed');
        } catch (error) {
          console.error('❌ Error closing database connection:', error);
        }
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();