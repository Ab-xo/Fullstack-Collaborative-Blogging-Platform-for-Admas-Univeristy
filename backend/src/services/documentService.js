import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import Document from '../models/Document.js';
import User from '../models/User.js';

/**
 * Document Service
 * 
 * Handles document upload, retrieval, validation, and deletion
 * for verification documents (graduation certificates, etc.)
 */

// Configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads/documents';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['application/pdf'];

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};

/**
 * Generate a unique filename for storage
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
export const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const uuid = uuidv4();
  const timestamp = Date.now();
  return `${uuid}-${timestamp}${ext}`;
};

/**
 * Validate a document file
 * @param {Object} file - File object with mimetype and size
 * @returns {{valid: boolean, error?: string}}
 */
export const validateDocument = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return { 
      valid: false, 
      error: 'Only PDF files are accepted. Please upload a PDF document.' 
    };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size must be under 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.` 
    };
  }
  
  return { valid: true };
};


/**
 * Upload a document
 * @param {Object} file - Multer file object
 * @param {string} userId - User ID
 * @param {string} [documentType='graduation_certificate'] - Type of document
 * @returns {Promise<Document>}
 */
export const uploadDocument = async (file, userId, documentType = 'graduation_certificate') => {
  // Validate file
  const validation = validateDocument(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Ensure upload directory exists
  await ensureUploadDir();
  
  // Generate unique filename
  const filename = generateUniqueFilename(file.originalname);
  const filePath = path.join(UPLOAD_DIR, filename);
  
  // Move file to storage location (if using multer diskStorage, file is already saved)
  // If using memoryStorage, we need to write the buffer
  if (file.buffer) {
    await fs.writeFile(filePath, file.buffer);
  } else if (file.path) {
    // File already saved by multer, just rename/move if needed
    const currentPath = file.path;
    if (currentPath !== filePath) {
      await fs.rename(currentPath, filePath);
    }
  }
  
  // Create document record
  const document = await Document.create({
    userId,
    filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    path: filePath,
    documentType
  });
  
  return document;
};

/**
 * Get a document by ID with access control
 * @param {string} documentId - Document ID
 * @param {string} requesterId - ID of user requesting access
 * @returns {Promise<{document: Document, filePath: string}>}
 */
export const getDocument = async (documentId, requesterId) => {
  // Find the document
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Check access control - only admin or document owner can access
  const requester = await User.findById(requesterId);
  if (!requester) {
    throw new Error('Unauthorized access');
  }
  
  const isAdmin = requester.role === 'admin' || requester.roles?.includes('admin');
  const isOwner = document.userId.toString() === requesterId.toString();
  
  if (!isAdmin && !isOwner) {
    throw new Error('You do not have permission to access this document');
  }
  
  // Verify file exists
  try {
    await fs.access(document.path);
  } catch {
    throw new Error('Document file not found on server');
  }
  
  return {
    document,
    filePath: document.path
  };
};

/**
 * Delete a document
 * @param {string} documentId - Document ID
 * @returns {Promise<void>}
 */
export const deleteDocument = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) {
    return; // Already deleted or doesn't exist
  }
  
  // Delete file from storage
  try {
    await fs.unlink(document.path);
  } catch (err) {
    console.error(`Failed to delete file ${document.path}:`, err.message);
    // Continue with database deletion even if file deletion fails
  }
  
  // Delete document record
  await Document.findByIdAndDelete(documentId);
};

/**
 * Delete all documents for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of documents deleted
 */
export const deleteUserDocuments = async (userId) => {
  const documents = await Document.find({ userId });
  
  // Delete all files
  for (const doc of documents) {
    try {
      await fs.unlink(doc.path);
    } catch (err) {
      console.error(`Failed to delete file ${doc.path}:`, err.message);
    }
  }
  
  // Delete all document records
  const result = await Document.deleteMany({ userId });
  return result.deletedCount;
};

/**
 * Get document by user ID and type
 * @param {string} userId - User ID
 * @param {string} documentType - Document type
 * @returns {Promise<Document|null>}
 */
export const getDocumentByUserAndType = async (userId, documentType) => {
  return Document.findOne({ userId, documentType });
};

export default {
  uploadDocument,
  getDocument,
  deleteDocument,
  deleteUserDocuments,
  validateDocument,
  generateUniqueFilename,
  getDocumentByUserAndType
};
