import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import documentService from '../services/documentService.js';
import Document from '../models/Document.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads/documents');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @route   POST /api/documents/upload
 * @desc    Upload a verification document
 * @access  Public (for registration) or Private
 */
router.post('/upload', upload.single('document'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Please select a PDF file.'
    });
  }

  // For registration, userId might not exist yet
  // Store document with temporary reference
  const userId = req.user?._id || req.body.tempUserId || null;
  const documentType = req.body.documentType || 'graduation_certificate';

  try {
    const document = await Document.create({
      userId: userId || undefined,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      documentType
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        filename: document.filename,
        originalName: document.originalName,
        size: document.size,
        uploadedAt: document.uploadedAt
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    const fs = await import('fs/promises');
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error('Failed to clean up file:', unlinkError);
    }
    throw error;
  }
}));


/**
 * @route   GET /api/documents/:id
 * @desc    Get a document by ID (admin only or document owner)
 * @access  Private
 */
router.get('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const { document, filePath } = await documentService.getDocument(
      req.params.id,
      req.user._id
    );

    // Set headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);

    // Stream the file
    const fs = await import('fs');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    if (error.message.includes('permission')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    throw error;
  }
}));

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document (admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  await documentService.deleteDocument(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Document deleted successfully'
  });
}));

/**
 * @route   GET /api/documents/user/:userId
 * @desc    Get all documents for a user (admin only)
 * @access  Private/Admin
 */
router.get('/user/:userId', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const documents = await Document.findByUserId(req.params.userId);

  res.status(200).json({
    success: true,
    count: documents.length,
    documents
  });
}));

export default router;
