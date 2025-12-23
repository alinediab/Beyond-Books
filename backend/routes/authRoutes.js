const express = require('express');
const router = express.Router();
const { register, login, requestPasswordReset, verifyResetCode, resetPassword } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validate');

// Register endpoint: POST /auth/register/:role
router.post('/register/:role', validateRegister, register);

// Login endpoint: POST /auth/login/:role
router.post('/login/:role', validateLogin, (req, res, next) => {
  // Set role from params for login handler
  req.role = req.params.role;
  next();
}, login);

// Forgot password endpoints
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

module.exports = router;