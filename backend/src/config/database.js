import mongoose from 'mongoose';

// Suppress mongoose deprecation warnings
mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // Import User model after connection is established
    const User = (await import('../models/User.js')).default;
    
    // Create default admin user silently
    try {
      await User.createDefaultAdmin();
    } catch (adminError) {
      // Silent fail - admin might already exist
    }
    
    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Handle MongoDB connection events (only log errors)
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

export default connectDB;