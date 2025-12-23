// Role constants
exports.ROLES = {
  STUDENT: 'student',
  PROFESSOR: 'professor',
  STUDENT_AFFAIR: 'studentAffair',
  ADMIN: 'admin'
};

// Table configurations for each role
// Note: Table names match actual database table names (lowercase)
exports.ROLE_CONFIG = {
  student: {
    tableName: 'student',  // Database uses lowercase
    idField: 'studentID',
    emailField: 'universityMail',
    selectFields: 'studentID, firstName, lastName, universityMail, phoneNumber, major, departmentName',
    insertFields: ['studentID', 'firstName', 'lastName', 'universityMail', 'phoneNumber', 'major', 'departmentName', 'password'],
    requiredFields: ['studentID', 'firstName', 'lastName', 'universityMail', 'password'],
    optionalFields: ['phoneNumber', 'major', 'departmentName']
  },
  professor: {
    tableName: 'professor',  // Database uses lowercase
    idField: 'professorID',
    emailField: 'email',
    selectFields: 'professorID, firstName, lastName, email, officeHours, officeLocation, facultyName',
    insertFields: ['professorID', 'firstName', 'lastName', 'email', 'facultyName', 'officeHours', 'officeLocation', 'password'],
    requiredFields: ['professorID', 'firstName', 'lastName', 'email', 'password', 'facultyName'],
    optionalFields: ['officeHours', 'officeLocation']
  },
  studentAffair: {
    tableName: 'studentaffairsofficer',  // Database uses lowercase
    idField: 'studentAffairsOfficerID',
    emailField: 'email',
    selectFields: 'studentAffairsOfficerID, firstName, lastName, email, phoneNumber, staffDepartment',
    insertFields: ['studentAffairsOfficerID', 'firstName', 'lastName', 'email', 'phoneNumber', 'staffDepartment', 'password'],
    requiredFields: ['studentAffairsOfficerID', 'firstName', 'lastName', 'email', 'password', 'staffDepartment'],
    optionalFields: ['phoneNumber']
  },
  admin: {
    tableName: 'admin',  // Database uses lowercase
    idField: 'adminID',
    emailField: 'email',
    selectFields: 'adminID, username, email',
    insertFields: ['adminID', 'username', 'email', 'password'],
    requiredFields: ['adminID', 'username', 'email', 'password'],
    optionalFields: []
  }
};

// All tables to check for ID uniqueness
// Note: Table names match actual database table names (lowercase)
exports.ALL_ID_TABLES = [
  { table: 'student', idField: 'studentID' },
  { table: 'studentaffairsofficer', idField: 'studentAffairsOfficerID' },
  { table: 'professor', idField: 'professorID' },
  { table: 'admin', idField: 'adminID' }
];

// Error messages
exports.ERROR_MESSAGES = {
  MISSING_FIELDS: 'Missing required fields',
  INVALID_ID_FORMAT: 'ID must be exactly 9 digits',
  ID_EXISTS: 'ID already exists in the system',
  EMAIL_EXISTS: 'Email already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
  NOT_FOUND: 'Resource not found',
  NO_FIELDS_TO_UPDATE: 'No fields to update',
  UNAUTHORIZED: 'Not authenticated',
  FORBIDDEN: 'Forbidden'
};

