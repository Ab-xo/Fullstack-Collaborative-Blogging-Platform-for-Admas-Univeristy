/**
 * Schema Parser Utility
 * Extracts field definitions, types, and constraints from the user schema
 */

/**
 * Field group categories for organizing documentation
 */
export const FIELD_GROUPS = {
  BASIC_INFO: 'Basic Information',
  UNIVERSITY_INFO: 'University Information',
  VERIFICATION: 'Verification',
  ACCOUNT_STATUS: 'Account Status & Roles',
  EMAIL_VERIFICATION: 'Email Verification',
  PROFILE: 'Profile',
  PREFERENCES: 'User Preferences',
  FIREBASE_AUTH: 'Firebase Authentication',
  ADMIN_REVIEW: 'Admin Review',
  SECURITY: 'Timestamps & Security'
};

/**
 * Maps field names to their logical groups
 */
const FIELD_TO_GROUP_MAP = {
  // Basic Information
  firstName: FIELD_GROUPS.BASIC_INFO,
  lastName: FIELD_GROUPS.BASIC_INFO,
  email: FIELD_GROUPS.BASIC_INFO,
  username: FIELD_GROUPS.BASIC_INFO,
  password: FIELD_GROUPS.BASIC_INFO,
  
  // University Information
  roleApplication: FIELD_GROUPS.UNIVERSITY_INFO,
  universityId: FIELD_GROUPS.UNIVERSITY_INFO,
  department: FIELD_GROUPS.UNIVERSITY_INFO,
  yearOfStudy: FIELD_GROUPS.UNIVERSITY_INFO,
  position: FIELD_GROUPS.UNIVERSITY_INFO,
  graduationYear: FIELD_GROUPS.UNIVERSITY_INFO,
  
  // Verification
  verificationDocument: FIELD_GROUPS.VERIFICATION,
  
  // Account Status & Roles
  status: FIELD_GROUPS.ACCOUNT_STATUS,
  roles: FIELD_GROUPS.ACCOUNT_STATUS,
  
  // Email Verification
  isEmailVerified: FIELD_GROUPS.EMAIL_VERIFICATION,
  emailVerificationToken: FIELD_GROUPS.EMAIL_VERIFICATION,
  emailVerificationExpires: FIELD_GROUPS.EMAIL_VERIFICATION,
  
  // Profile
  profile: FIELD_GROUPS.PROFILE,
  
  // Preferences
  preferences: FIELD_GROUPS.PREFERENCES,
  
  // Firebase Authentication
  firebaseUid: FIELD_GROUPS.FIREBASE_AUTH,
  
  // Admin Review
  reviewedBy: FIELD_GROUPS.ADMIN_REVIEW,
  reviewNotes: FIELD_GROUPS.ADMIN_REVIEW,
  reviewedAt: FIELD_GROUPS.ADMIN_REVIEW,
  
  // Security
  lastLogin: FIELD_GROUPS.SECURITY,
  passwordChangedAt: FIELD_GROUPS.SECURITY,
  loginAttempts: FIELD_GROUPS.SECURITY,
  lockUntil: FIELD_GROUPS.SECURITY
};

/**
 * Categorizes a field into its logical group
 * @param {string} fieldName - The name of the field
 * @returns {string} The field group name
 */
export function categorizeField(fieldName) {
  return FIELD_TO_GROUP_MAP[fieldName] || 'Other';
}

/**
 * Extracts field information from schema field definition
 * @param {string} fieldName - The name of the field
 * @param {Object} fieldDef - The field definition from schema
 * @returns {Object} Parsed field information
 */
export function parseField(fieldName, fieldDef) {
  const field = {
    name: fieldName,
    group: categorizeField(fieldName),
    type: getFieldType(fieldDef),
    required: getRequiredStatus(fieldDef),
    unique: fieldDef.unique || false,
    default: fieldDef.default,
    validation: extractValidation(fieldDef),
    description: extractDescription(fieldDef),
    isPrivate: fieldDef.select === false,
    enum: fieldDef.enum || null
  };
  
  return field;
}

/**
 * Gets the type of a field
 * @param {Object} fieldDef - The field definition
 * @returns {string} The field type
 */
function getFieldType(fieldDef) {
  if (Array.isArray(fieldDef)) {
    return `Array<${getFieldType(fieldDef[0])}>`;
  }
  
  if (fieldDef.type) {
    const typeName = fieldDef.type.name || fieldDef.type;
    return typeName.toString();
  }
  
  if (typeof fieldDef === 'object' && !fieldDef.type) {
    return 'Object';
  }
  
  return 'String';
}

/**
 * Determines if a field is required
 * @param {Object} fieldDef - The field definition
 * @returns {boolean|string} Required status or condition
 */
function getRequiredStatus(fieldDef) {
  if (Array.isArray(fieldDef.required)) {
    return fieldDef.required[0];
  }
  
  if (typeof fieldDef.required === 'function') {
    return 'Conditional';
  }
  
  return fieldDef.required || false;
}

/**
 * Extracts validation rules from field definition
 * @param {Object} fieldDef - The field definition
 * @returns {Array} Array of validation rules
 */
function extractValidation(fieldDef) {
  const rules = [];
  
  if (fieldDef.minlength) {
    const min = Array.isArray(fieldDef.minlength) ? fieldDef.minlength[0] : fieldDef.minlength;
    rules.push({
      type: 'minlength',
      value: min,
      message: Array.isArray(fieldDef.minlength) ? fieldDef.minlength[1] : `Minimum length: ${min}`
    });
  }
  
  if (fieldDef.maxlength) {
    const max = Array.isArray(fieldDef.maxlength) ? fieldDef.maxlength[0] : fieldDef.maxlength;
    rules.push({
      type: 'maxlength',
      value: max,
      message: Array.isArray(fieldDef.maxlength) ? fieldDef.maxlength[1] : `Maximum length: ${max}`
    });
  }
  
  if (fieldDef.match) {
    rules.push({
      type: 'pattern',
      value: fieldDef.match[0].toString(),
      message: fieldDef.match[1] || 'Must match pattern'
    });
  }
  
  if (fieldDef.enum) {
    rules.push({
      type: 'enum',
      value: fieldDef.enum,
      message: `Must be one of: ${fieldDef.enum.join(', ')}`
    });
  }
  
  if (fieldDef.lowercase) {
    rules.push({
      type: 'transform',
      value: 'lowercase',
      message: 'Converted to lowercase'
    });
  }
  
  if (fieldDef.trim) {
    rules.push({
      type: 'transform',
      value: 'trim',
      message: 'Whitespace trimmed'
    });
  }
  
  return rules;
}

/**
 * Extracts description from field definition
 * @param {Object} fieldDef - The field definition
 * @returns {string} Field description
 */
function extractDescription(fieldDef) {
  if (Array.isArray(fieldDef.required) && fieldDef.required[1]) {
    return fieldDef.required[1];
  }
  return '';
}

/**
 * Parses the entire schema and returns organized field data
 * @param {Object} schemaFields - The schema fields object
 * @returns {Object} Organized field data by group
 */
export function parseSchema(schemaFields) {
  const fieldsByGroup = {};
  const allFields = [];
  
  // Initialize groups
  Object.values(FIELD_GROUPS).forEach(group => {
    fieldsByGroup[group] = [];
  });
  
  // Parse each field
  Object.entries(schemaFields).forEach(([fieldName, fieldDef]) => {
    const parsedField = parseField(fieldName, fieldDef);
    allFields.push(parsedField);
    
    const group = parsedField.group;
    if (!fieldsByGroup[group]) {
      fieldsByGroup[group] = [];
    }
    fieldsByGroup[group].push(parsedField);
  });
  
  return {
    fieldsByGroup,
    allFields,
    groups: Object.values(FIELD_GROUPS)
  };
}

/**
 * Gets all enum fields from the schema
 * @param {Array} fields - Array of parsed fields
 * @returns {Array} Array of enum fields
 */
export function getEnumFields(fields) {
  return fields.filter(field => field.enum !== null);
}

/**
 * Gets all security-related fields
 * @param {Array} fields - Array of parsed fields
 * @returns {Array} Array of security fields
 */
export function getSecurityFields(fields) {
  return fields.filter(field => 
    field.group === FIELD_GROUPS.SECURITY || 
    field.name === 'password' ||
    field.isPrivate
  );
}

/**
 * Gets all timestamp/audit fields
 * @param {Array} fields - Array of parsed fields
 * @returns {Array} Array of timestamp fields
 */
export function getTimestampFields(fields) {
  const timestampFieldNames = ['createdAt', 'updatedAt', 'lastLogin', 'reviewedAt', 'passwordChangedAt'];
  return fields.filter(field => timestampFieldNames.includes(field.name));
}
