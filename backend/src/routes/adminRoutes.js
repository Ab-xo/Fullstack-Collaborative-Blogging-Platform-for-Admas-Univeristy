import express from 'express';
import {
  getPendingUsers,
  getAllUsers,
  getUserStats,
  approveUser,
  rejectUser,
  updateUserRoles,
  suspendUser,
  activateUser,
  getUserDetails,
  bulkApproveUsers,
  deleteUser,
  getAuditLogs,
  getAuditLogStats,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/adminController.js';
import {
  getPendingAuthors,
  approveAuthor,
  rejectAuthor
} from '../controllers/adminAuthorController.js';
import {
  validateUserApproval,
  validateIdParam,
  validatePagination,
  handleValidationErrors
} from '../middleware/validationMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/pending-users', validatePagination, handleValidationErrors, getPendingUsers);
router.get('/users', validatePagination, handleValidationErrors, getAllUsers);
router.get('/stats', getUserStats);
router.get('/users/:id', validateIdParam, handleValidationErrors, getUserDetails);
router.put('/users/:id/approve', validateIdParam, validateUserApproval, handleValidationErrors, approveUser);
router.put('/users/:id/reject', validateIdParam, handleValidationErrors, rejectUser);
router.put('/users/:id/roles', validateIdParam, validateUserApproval, handleValidationErrors, updateUserRoles);
router.put('/users/:id/suspend', validateIdParam, handleValidationErrors, suspendUser);
router.put('/users/:id/activate', validateIdParam, handleValidationErrors, activateUser);
router.delete('/users/:id', validateIdParam, handleValidationErrors, deleteUser);
router.post('/users/bulk-approve', bulkApproveUsers);

// Author Application Routes
router.get('/pending-authors', getPendingAuthors);
router.put('/authors/:id/approve', validateIdParam, handleValidationErrors, approveAuthor);
router.put('/authors/:id/reject', validateIdParam, handleValidationErrors, rejectAuthor);

// Audit log routes
router.get('/audit-logs', validatePagination, handleValidationErrors, getAuditLogs);
router.get('/audit-logs/stats', getAuditLogStats);

// System settings routes
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router;