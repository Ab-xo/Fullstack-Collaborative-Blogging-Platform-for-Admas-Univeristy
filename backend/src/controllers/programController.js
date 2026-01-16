import Program from '../models/Program.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import AuditLogService from '../services/auditLogService.js';

/**
 * @desc    Get all programs (Public)
 * @route   GET /api/programs
 * @access  Public
 */
export const getPrograms = asyncHandler(async (req, res) => {
    const { activeOnly } = req.query;

    const query = {};
    if (activeOnly === 'true') {
        query.isActive = true;
    }

    const programs = await Program.find(query).sort({ order: 1, name: 1 });

    res.status(200).json({
        success: true,
        count: programs.length,
        data: programs
    });
});

/**
 * @desc    Get single program
 * @route   GET /api/programs/:id
 * @access  Public
 */
export const getProgramById = asyncHandler(async (req, res) => {
    const program = await Program.findById(req.params.id);

    if (!program) {
        res.status(404);
        throw new Error('Program not found');
    }

    res.status(200).json({
        success: true,
        data: program
    });
});

/**
 * @desc    Create a program
 * @route   POST /api/programs
 * @access  Private/Admin
 */
export const createProgram = asyncHandler(async (req, res) => {
    const { name, description, icon, color, order, isActive } = req.body;

    const program = await Program.create({
        name,
        description,
        icon,
        color,
        order,
        isActive,
        createdBy: req.user._id
    });

    // Log audit
    await AuditLogService.logProgramCreated(program._id, req.user._id, program.name, req);

    res.status(201).json({
        success: true,
        data: program
    });
});

/**
 * @desc    Update a program
 * @route   PUT /api/programs/:id
 * @access  Private/Admin
 */
export const updateProgram = asyncHandler(async (req, res) => {
    const program = await Program.findById(req.params.id);

    if (!program) {
        res.status(404);
        throw new Error('Program not found');
    }

    const updatedProgram = await Program.findByIdAndUpdate(
        req.params.id,
        {
            ...req.body,
            updatedBy: req.user._id
        },
        { new: true, runValidators: true }
    );

    // Log audit
    await AuditLogService.logProgramUpdated(updatedProgram._id, req.user._id, updatedProgram.name, req);

    res.status(200).json({
        success: true,
        data: updatedProgram
    });
});

/**
 * @desc    Delete a program
 * @route   DELETE /api/programs/:id
 * @access  Private/Admin
 */
export const deleteProgram = asyncHandler(async (req, res) => {
    const program = await Program.findById(req.params.id);

    if (!program) {
        res.status(404);
        throw new Error('Program not found');
    }

    await program.deleteOne();

    // Log audit
    await AuditLogService.logProgramDeleted(program._id, req.user._id, program.name, req);

    res.status(200).json({
        success: true,
        data: {}
    });
});

/**
 * @desc    Reorder programs
 * @route   PUT /api/programs/reorder
 * @access  Private/Admin
 */
export const reorderPrograms = asyncHandler(async (req, res) => {
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
        res.status(400);
        throw new Error('Invalid data');
    }

    const operations = orderedIds.map((id, index) => ({
        updateOne: {
            filter: { _id: id },
            update: { order: index }
        }
    }));

    if (operations.length > 0) {
        await Program.bulkWrite(operations);

        // Log audit
        await AuditLogService.logProgramsReordered(req.user._id, operations.length, req);
    }

    res.status(200).json({
        success: true,
        message: 'Programs reordered successfully'
    });
});
