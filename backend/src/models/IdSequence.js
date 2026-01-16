import mongoose from 'mongoose';

/**
 * ID Sequence Counter Model
 * 
 * Tracks sequential ID numbers for each affiliation type and year combination.
 * Used to generate unique university IDs in the format: PREFIX####/YYYY
 * 
 * Prefixes:
 * - ADME: Alumni
 * - ADMS: Students
 * - ADMF: Faculty
 * - ADMT: Staff
 */

const idSequenceSchema = new mongoose.Schema(
  {
    // ID prefix (ADME, ADMS, ADMF, ADMT)
    prefix: {
      type: String,
      required: [true, 'Prefix is required'],
      enum: {
        values: ['ADME', 'ADMS', 'ADMF', 'ADMT'],
        message: 'Invalid prefix. Must be ADME, ADMS, ADMF, or ADMT'
      },
      uppercase: true
    },
    
    // Year component of the ID
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2000, 'Year must be 2000 or later'],
      max: [2100, 'Year must be 2100 or earlier']
    },
    
    // Current sequence number (0-9999)
    currentSequence: {
      type: Number,
      default: 0,
      min: [0, 'Sequence cannot be negative'],
      max: [9999, 'Sequence cannot exceed 9999']
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to ensure one counter per prefix-year combination
idSequenceSchema.index({ prefix: 1, year: 1 }, { unique: true });

/**
 * Get and increment the next sequence number atomically
 * @param {string} prefix - The ID prefix (ADME, ADMS, ADMF, ADMT)
 * @param {number} year - The year component
 * @returns {Promise<number>} The next sequence number
 */
idSequenceSchema.statics.getNextSequence = async function(prefix, year) {
  const result = await this.findOneAndUpdate(
    { prefix: prefix.toUpperCase(), year },
    { $inc: { currentSequence: 1 } },
    { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
  
  // Check for overflow
  if (result.currentSequence > 9999) {
    throw new Error(`ID sequence overflow for ${prefix}/${year}. Maximum 9999 IDs per year.`);
  }
  
  return result.currentSequence;
};

const IdSequence = mongoose.model('IdSequence', idSequenceSchema);

export default IdSequence;
