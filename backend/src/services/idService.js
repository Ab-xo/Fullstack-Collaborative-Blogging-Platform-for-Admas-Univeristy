import IdSequence from '../models/IdSequence.js';

/**
 * ID Generation Service
 * 
 * Generates and validates unique university IDs for different affiliation types.
 * 
 * ID Formats:
 * - Alumni:  ADME####/YYYY (e.g., ADME0001/2020)
 * - Student: ADMS####/YYYY (e.g., ADMS0001/2023)
 * - Faculty: ADMF####/YYYY (e.g., ADMF0001/2019)
 * - Staff:   ADMT####/YYYY (e.g., ADMT0001/2021)
 */

// ID Prefixes by affiliation type
const ID_PREFIXES = {
  alumni: 'ADME',
  student: 'ADMS',
  faculty: 'ADMF',
  staff: 'ADMT'
};

// Reverse mapping for validation
const PREFIX_TO_AFFILIATION = {
  'ADME': 'alumni',
  'ADMS': 'student',
  'ADMF': 'faculty',
  'ADMT': 'staff'
};

// ID format regex: PREFIX (4 chars) + 4 digits + / + 4 digit year
const ID_REGEX = /^(ADME|ADMS|ADMF|ADMT)(\d{4})\/(\d{4})$/;

/**
 * Get the prefix for an affiliation type
 * @param {string} affiliationType - The affiliation type (alumni, student, faculty, staff)
 * @returns {string} The corresponding prefix
 */
export const getPrefix = (affiliationType) => {
  const prefix = ID_PREFIXES[affiliationType?.toLowerCase()];
  if (!prefix) {
    throw new Error(`Invalid affiliation type: ${affiliationType}`);
  }
  return prefix;
};

/**
 * Get the affiliation type for a prefix
 * @param {string} prefix - The ID prefix (ADME, ADMS, ADMF, ADMT)
 * @returns {string} The corresponding affiliation type
 */
export const getAffiliationType = (prefix) => {
  const affiliation = PREFIX_TO_AFFILIATION[prefix?.toUpperCase()];
  if (!affiliation) {
    throw new Error(`Invalid prefix: ${prefix}`);
  }
  return affiliation;
};


/**
 * Generate a unique university ID
 * @param {string} affiliationType - The affiliation type (alumni, student, faculty, staff)
 * @param {number} [year] - The year component (defaults to current year)
 * @returns {Promise<{id: string, sequence: number, year: number, prefix: string}>}
 */
export const generateId = async (affiliationType, year = null) => {
  const prefix = getPrefix(affiliationType);
  const idYear = year || new Date().getFullYear();
  
  // Validate year
  if (idYear < 2000 || idYear > 2100) {
    throw new Error(`Invalid year: ${idYear}. Must be between 2000 and 2100.`);
  }
  
  // Get next sequence number atomically
  const sequence = await IdSequence.getNextSequence(prefix, idYear);
  
  // Format sequence as 4-digit zero-padded string
  const sequenceStr = sequence.toString().padStart(4, '0');
  
  // Construct the full ID
  const id = `${prefix}${sequenceStr}/${idYear}`;
  
  return {
    id,
    sequence,
    year: idYear,
    prefix
  };
};

/**
 * Parse a university ID into its components
 * @param {string} id - The university ID to parse
 * @returns {{prefix: string, sequence: number, year: number, affiliationType: string} | null}
 */
export const parseId = (id) => {
  if (!id || typeof id !== 'string') {
    return null;
  }
  
  const match = id.toUpperCase().match(ID_REGEX);
  if (!match) {
    return null;
  }
  
  const [, prefix, sequenceStr, yearStr] = match;
  
  return {
    prefix,
    sequence: parseInt(sequenceStr, 10),
    year: parseInt(yearStr, 10),
    affiliationType: PREFIX_TO_AFFILIATION[prefix]
  };
};

/**
 * Validate a university ID format and optionally check affiliation match
 * @param {string} id - The university ID to validate
 * @param {string} [expectedAffiliation] - Optional expected affiliation type
 * @returns {{valid: boolean, error?: string, parsed?: object}}
 */
export const validateId = (id, expectedAffiliation = null) => {
  const parsed = parseId(id);
  
  if (!parsed) {
    return {
      valid: false,
      error: 'Invalid ID format. Expected format: PREFIX####/YYYY (e.g., ADMS0001/2023)'
    };
  }
  
  // Check if affiliation matches expected
  if (expectedAffiliation) {
    const expectedPrefix = ID_PREFIXES[expectedAffiliation.toLowerCase()];
    if (parsed.prefix !== expectedPrefix) {
      return {
        valid: false,
        error: `ID prefix ${parsed.prefix} does not match expected affiliation ${expectedAffiliation} (expected ${expectedPrefix})`,
        parsed
      };
    }
  }
  
  // Validate year is reasonable
  const currentYear = new Date().getFullYear();
  if (parsed.year < 2000 || parsed.year > currentYear + 1) {
    return {
      valid: false,
      error: `Invalid year in ID: ${parsed.year}`,
      parsed
    };
  }
  
  return {
    valid: true,
    parsed
  };
};

/**
 * Check if an ID format is valid (without database check)
 * @param {string} id - The university ID to check
 * @returns {boolean}
 */
export const isValidIdFormat = (id) => {
  return ID_REGEX.test(id?.toUpperCase());
};

// Export constants for external use
export const PREFIXES = ID_PREFIXES;
export const AFFILIATIONS = PREFIX_TO_AFFILIATION;

export default {
  generateId,
  parseId,
  validateId,
  isValidIdFormat,
  getPrefix,
  getAffiliationType,
  PREFIXES,
  AFFILIATIONS
};
