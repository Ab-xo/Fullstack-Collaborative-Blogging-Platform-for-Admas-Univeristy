import User from '../models/User.js';
import multer from 'multer';
import { uploadAvatarToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary.js';

// Configure multer for memory storage (Cloudinary upload)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, username, bio, phone, website, twitter, linkedin, github } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username is already taken (if provided and different from current)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        username: username.toLowerCase(),
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    // Update basic info
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (username !== undefined) user.username = username ? username.toLowerCase() : null;

    // Update profile fields
    if (bio !== undefined) user.profile.bio = bio;
    
    // Update contact info
    if (phone !== undefined) user.profile.contactInfo.phone = phone;
    if (website !== undefined) user.profile.contactInfo.website = website;

    // Update social media
    if (twitter !== undefined) user.profile.socialMedia.twitter = twitter;
    if (linkedin !== undefined) user.profile.socialMedia.linkedin = linkedin;
    if (github !== undefined) user.profile.socialMedia.github = github;

    // Handle profile image upload to Cloudinary
    if (req.file) {
      try {
        // Delete old profile image from Cloudinary if exists
        if (user.profile.avatar) {
          const publicId = extractPublicId(user.profile.avatar);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        }

        // Upload new image to Cloudinary using buffer
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        const cloudinary = (await import('../config/cloudinary.js')).default;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'admas-blog/profiles',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });

        user.profile.avatar = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload profile image'
        });
      }
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation error'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update profile image from URL
export const updateProfileImageUrl = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const userId = req.user.id;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile image from Cloudinary if it exists and is not a URL
    if (user.profile.avatar && !user.profile.avatar.startsWith('http')) {
      try {
        const publicId = extractPublicId(user.profile.avatar);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.log('Cloudinary deletion failed:', error.message);
      }
    }

    // Save the image URL directly
    user.profile.avatar = imageUrl;
    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile image URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete profile image
export const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.profile.avatar) {
      return res.status(400).json({
        success: false,
        message: 'No profile image to delete'
      });
    }

    // Delete image from Cloudinary only if it's not an external URL
    if (!user.profile.avatar.startsWith('http://') && !user.profile.avatar.startsWith('https://')) {
      try {
        const publicId = extractPublicId(user.profile.avatar);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.log('Cloudinary deletion failed:', error.message);
      }
    }

    // Update user record
    user.profile.avatar = '';
    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile image deleted successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
