const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { hash, compare } = require('../utils/hash');
const { sign } = require('../utils/token');
const { ROLES, ROLE_CONFIG, ALL_ID_TABLES, ERROR_MESSAGES } = require('../utils/constants');
const { sendEmail } = require('../utils/email');

// In-memory store for password reset codes
// Format: { email: { code: string, expiresAt: Date, used: boolean } }
const resetCodesStore = new Map();

// Clean up expired codes every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [email, data] of resetCodesStore.entries()) {
    if (data.expiresAt < now || data.used) {
      resetCodesStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if ID exists across all user tables
 */
const checkIDUniqueness = async (id) => {
  let checkedTables = 0;
  let errors = [];
  
  for (const tableConfig of ALL_ID_TABLES) {
    try {
      const [rows] = await db.query(
        `SELECT ${tableConfig.idField} FROM ${tableConfig.table} WHERE ${tableConfig.idField} = ?`,
        [id]
      );
      checkedTables++;
      if (rows.length > 0) {
        return false; // ID exists in at least one table
      }
    } catch (error) {
      // Log error but continue checking other tables
      console.warn(`Warning: Could not check ID uniqueness in table ${tableConfig.table}:`, error.message);
      errors.push({ table: tableConfig.table, error: error.message });
      // Continue checking other tables
    }
  }
  
  // If we couldn't check any tables, throw an error
  if (checkedTables === 0 && errors.length > 0) {
    console.error('Error checking ID uniqueness - all tables failed:', errors);
    throw new Error('Database error: Unable to verify ID uniqueness. Please check database connection.');
  }
  
  // If we checked at least one table successfully and ID wasn't found, it's unique
  return true;
};

/**
 * Check if email exists in specific table
 */
const checkEmailUniqueness = async (email, tableName, emailField) => {
  try {
    const [rows] = await db.query(
      `SELECT ${emailField} FROM ${tableName} WHERE ${emailField} = ?`,
      [email]
    );
    return rows.length === 0;
  } catch (error) {
    console.error('Error checking email uniqueness:', error);
    throw new Error('Database error: Unable to verify email uniqueness. Please check database connection.');
  }
};

/**
 * Unified registration handler
 */
exports.register = asyncHandler(async (req, res) => {
  const { role } = req;
  const config = ROLE_CONFIG[role];
  
  if (!config) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const idField = config.idField;
  const id = req.body[idField];

  // Check ID format (9 digits)
  if (!/^\d{9}$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_ID_FORMAT
    });
  }

  // Check ID uniqueness across all tables
  const isIdUnique = await checkIDUniqueness(id);
  if (!isIdUnique) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.ID_EXISTS
    });
  }

  // Check email uniqueness within role's table
  const email = req.body[config.emailField];
  const isEmailUnique = await checkEmailUniqueness(email, config.tableName, config.emailField);
  if (!isEmailUnique) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.EMAIL_EXISTS
    });
  }

  // Hash password
  const hashed = await hash(req.body.password);

  // Build insert query
  const insertFields = [...config.insertFields];
  
  // Map values, ensuring ID field is included
  const values = insertFields.map(field => {
    if (field === 'password') {
      return hashed;
    }
    // Handle ID field separately
    if (field === config.idField) {
      return req.body[config.idField] || req.body[field] || null;
    }
    return req.body[field] || null;
  });

  const placeholders = insertFields.map(() => '?').join(', ');
  const fieldNames = insertFields.join(', ');
  
  // Debug logging
  console.log(`[DEBUG] Registration - Role: ${role}, Table: ${config.tableName}`);
  console.log(`[DEBUG] Request body keys:`, Object.keys(req.body));
  console.log(`[DEBUG] Insert fields:`, insertFields);
  console.log(`[DEBUG] Field names:`, fieldNames);

  // Insert user
  try {
    console.log(`[DEBUG] Inserting into ${config.tableName}`);
    console.log(`[DEBUG] Fields: ${fieldNames}`);
    console.log(`[DEBUG] Values:`, values.map(v => v ? (typeof v === 'string' && v.length > 20 ? v.substring(0, 20) + '...' : v) : 'NULL'));
    
    await db.query(
      `INSERT INTO ${config.tableName} (${fieldNames}) VALUES (${placeholders})`,
      values
    );
    
    console.log(`[DEBUG] Successfully inserted user with ID: ${id}`);
  } catch (error) {
    console.error('Database insert error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('SQL State:', error.sqlState);
    console.error('SQL Message:', error.sqlMessage);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'This email or ID already exists in the system'
      });
    }
    
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({
        success: false,
        message: `Database error: Invalid field name - ${error.sqlMessage}`
      });
    }
    
    return res.status(500).json({
      success: false,
      message: `Database error: ${error.sqlMessage || error.message || 'Failed to create user account'}`,
      errorCode: error.code
    });
  }

  // Generate token - map backend role to frontend role
  const frontendRole = role === 'studentAffair' ? 'studentAffair' : role === 'professor' ? 'professor' : role === 'admin' ? 'admin' : role;
  const token = sign({ id, role: frontendRole });

  res.status(201).json({
    success: true,
    token
  });
});

/**
 * Unified login handler
 */
exports.login = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const config = ROLE_CONFIG[role];

  if (!config) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const { password } = req.body;
  const emailField = config.emailField;
  const email = req.body[emailField]; // Use the correct field name (email or universityMail)

  // Find user by email
  const [rows] = await db.query(
    `SELECT ${config.idField}, password FROM ${config.tableName} WHERE ${emailField} = ?`,
    [email]
  );

  if (!rows.length) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS
    });
  }

  // Verify password
  const ok = await compare(password, rows[0].password);
  if (!ok) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS
    });
  }

  // Generate token - map backend role to frontend role
  const frontendRole = role === 'studentAffair' ? 'studentAffair' : role === 'professor' ? 'professor' : role === 'admin' ? 'admin' : role;
  const token = sign({
    id: rows[0][config.idField],
    role: frontendRole
  });

  res.json({
    success: true,
    token
  });
});

/**
 * Find user by email across all role tables
 */
const findUserByEmail = async (email) => {
  // Check all role tables
  for (const role of Object.keys(ROLE_CONFIG)) {
    const config = ROLE_CONFIG[role];
    try {
      const [rows] = await db.query(
        `SELECT ${config.idField} AS id, '${role}' AS role FROM ${config.tableName} WHERE ${config.emailField} = ?`,
        [email]
      );
      if (rows.length > 0) {
        return { id: rows[0].id, role: rows[0].role };
      }
    } catch (error) {
      // Continue checking other tables
      continue;
    }
  }
  return null;
};

/**
 * Generate a 6-digit reset code
 */
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Request password reset - send code to email
 */
exports.requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Find user by email
  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal if email exists or not for security
    return res.json({
      success: true,
      message: 'If the email exists, a reset code has been sent'
    });
  }

  // Generate reset code
  const resetCode = generateResetCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  // Store reset code in memory (replace any existing code for this email)
  resetCodesStore.set(email, {
    code: resetCode,
    expiresAt: expiresAt,
    used: false
  });

  // Send email with reset code
  const emailSubject = 'Password Reset Code - BeyondBooks';
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4A70A9;">Password Reset Request</h2>
      <p>You have requested to reset your password for your BeyondBooks account.</p>
      <p>Your reset code is:</p>
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
        <h1 style="color: #4A70A9; margin: 0; font-size: 32px; letter-spacing: 5px;">${resetCode}</h1>
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you did not request this password reset, please ignore this email.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">Best regards,<br>The BeyondBooks Team</p>
    </div>
  `;

  try {
    await sendEmail(email, emailSubject, emailHtml);
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send reset code email'
    });
  }

  res.json({
    success: true,
    message: 'If the email exists, a reset code has been sent'
  });
});

/**
 * Verify reset code
 */
exports.verifyResetCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: 'Email and code are required'
    });
  }

  // Get reset code from memory store
  const resetData = resetCodesStore.get(email);

  if (!resetData) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset code'
    });
  }

  // Check if code matches
  if (resetData.code !== code) {
    return res.status(400).json({
      success: false,
      message: 'Invalid reset code'
    });
  }

  // Check if code has expired
  if (resetData.expiresAt < new Date()) {
    resetCodesStore.delete(email);
    return res.status(400).json({
      success: false,
      message: 'Reset code has expired'
    });
  }

  // Check if code has been used
  if (resetData.used) {
    return res.status(400).json({
      success: false,
      message: 'Reset code has already been used'
    });
  }

  res.json({
    success: true,
    message: 'Reset code is valid'
  });
});

/**
 * Reset password with code
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email, code, and new password are required'
    });
  }

  // Validate password length
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  // Verify reset code from memory store
  const resetData = resetCodesStore.get(email);

  if (!resetData) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset code'
    });
  }

  // Check if code matches
  if (resetData.code !== code) {
    return res.status(400).json({
      success: false,
      message: 'Invalid reset code'
    });
  }

  // Check if code has expired
  if (resetData.expiresAt < new Date()) {
    resetCodesStore.delete(email);
    return res.status(400).json({
      success: false,
      message: 'Reset code has expired'
    });
  }

  // Check if code has been used
  if (resetData.used) {
    return res.status(400).json({
      success: false,
      message: 'Reset code has already been used'
    });
  }

  // Find user by email
  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user's role config
  const config = ROLE_CONFIG[user.role];
  if (!config) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user role'
    });
  }

  // Hash new password
  const hashedPassword = await hash(newPassword);

  // Update password in database directly in user table
  try {
    await db.query(
      `UPDATE ${config.tableName} SET password = ? WHERE ${config.emailField} = ?`,
      [hashedPassword, email]
    );
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }

  // Mark reset code as used and remove from store
  resetCodesStore.delete(email);

  res.json({
    success: true,
    message: 'Password has been reset successfully'
  });
});