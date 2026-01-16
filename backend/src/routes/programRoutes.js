import express from 'express';
import {
    getPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram,
    reorderPrograms
} from '../controllers/programController.js';
import { protect, isAdmin as admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getPrograms);
router.get('/:id', getProgramById);

// Protected Admin routes
router.post('/', protect, admin, createProgram);
router.put('/reorder', protect, admin, reorderPrograms);
router.put('/:id', protect, admin, updateProgram);
router.delete('/:id', protect, admin, deleteProgram);

export default router;
