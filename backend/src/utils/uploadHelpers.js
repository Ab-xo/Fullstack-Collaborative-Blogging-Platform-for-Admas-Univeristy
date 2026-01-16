import { 
  uploadToCloudinary as cloudinaryUpload, 
  uploadImageToCloudinary, 
  uploadAvatarToCloudinary, 
  deleteFromCloudinary,
  extractPublicId 
} from '../config/cloudinary.js';

import fs from 'fs';
import path from 'path';

/**
 * Upload file with Cloudinary support
 */
export const uploadFile = async (file, type = 'general') => {
  try {
    let result;

    switch (type) {
      case 'avatar':
        result = await uploadAvatarToCloudinary(file.path);
        break;

      case 'image':
        result = await uploadImageToCloudinary(file.path);
        break;

      default:
        result = await cloudinaryUpload(file.path);
    }

    // Remove local file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 */
export const deleteFile = async (url) => {
  try {
    const publicId = extractPublicId(url);

    if (publicId) {
      return await deleteFromCloudinary(publicId);
    }

    return { result: 'not_found' };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Validate file type
 */
export const validateFileType = (
  file,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) => {
  return allowedTypes.includes(file.mimetype);
};

/**
 * Validate file size
 */
export const validateFileSize = (file, maxSize = 5 * 1024 * 1024) => {
  return file.size <= maxSize;
};

/**
 * Generate a unique filename
 */
export const generateUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalname);

  return `${timestamp}-${random}${extension}`;
};

// Optional backward compatibility export
// export const uploadToCloudinary = uploadFile;
