import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test Cloudinary connection
export const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

// Upload utility functions
export const uploadToCloudinary = async (filePath, folder = 'admas-blog') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `${folder}/uploads`,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('File upload failed');
  }
};

export const uploadImageToCloudinary = async (filePath, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'admas-blog/images',
      transformation: [
        { width: 1200, height: 630, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };

    const result = await cloudinary.uploader.upload(filePath, {
      ...defaultOptions,
      ...options
    });
    return result;
  } catch (error) {
    console.error('Cloudinary image upload error:', error);
    throw new Error('Image upload failed');
  }
};

export const uploadAvatarToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'admas-blog/avatars',
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    return result;
  } catch (error) {
    console.error('Cloudinary avatar upload error:', error);
    throw new Error('Avatar upload failed');
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('File deletion failed');
  }
};

export const extractPublicId = (url) => {
  const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
  return matches ? matches[1] : null;
};

export default cloudinary;