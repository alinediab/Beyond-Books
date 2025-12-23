const Joi = require('joi');
const { ROLES, ROLE_CONFIG, ERROR_MESSAGES } = require('../utils/constants');

// Login validation schema (role-aware)
exports.validateLogin = (req, res, next) => {
  const { role } = req.params;
  const config = ROLE_CONFIG[role];
  
  if (!config) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  // Use the correct email field name for the role
  const emailField = config.emailField;
  const schema = Joi.object({
    [emailField]: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Registration validation schema (role-specific)
exports.validateRegister = (req, res, next) => {
  const { role } = req.params;
  
  // Check if role exists in ROLE_CONFIG (admin and staff are valid backend roles)
  if (!ROLE_CONFIG[role]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const config = ROLE_CONFIG[role];
  if (!config) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role configuration'
    });
  }

  // Build schema based on role configuration
  const schemaFields = {};
  
  // ID field (always required, 9 digits)
  schemaFields[config.idField] = Joi.string().pattern(/^\d{9}$/).required();
  
  // Required fields
  config.requiredFields.forEach(field => {
    if (field !== config.idField && field !== 'password') {
      if (field === 'email' || field === 'universityMail') {
        schemaFields[field] = Joi.string().email().required();
      } else {
        schemaFields[field] = Joi.string().required();
      }
    }
  });
  
  // Password
  schemaFields.password = Joi.string().min(6).required();
  
  // Optional fields
  config.optionalFields.forEach(field => {
    schemaFields[field] = Joi.string().allow(null, '').optional();
  });

  const schema = Joi.object(schemaFields);

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  req.role = role;
  next();
};

// Generic update validation helper
exports.validateUpdate = (allowedFields) => {
  return (req, res, next) => {
    const updates = Object.keys(req.body);
    const invalidFields = updates.filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${invalidFields.join(', ')}`
      });
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.NO_FIELDS_TO_UPDATE
      });
    }
    
    next();
  };
};