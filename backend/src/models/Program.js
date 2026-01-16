import mongoose from 'mongoose';

/**
 * Program Model
 * Represents an academic program (e.g., Accounting, MBA, CS)
 * Dynamic management for the Programs category
 */
const programSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Program name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    icon: {
        type: String,
        required: [true, 'Icon name is required'],
        default: 'BookOpen' // Default Lucide icon name
    },
    color: {
        type: String,
        default: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for sorting by order
programSchema.index({ order: 1 });
programSchema.index({ isActive: 1 });

const Program = mongoose.model('Program', programSchema);

export default Program;
