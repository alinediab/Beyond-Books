// routes/healthRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    res.json({
      success: true,
      message: 'API is healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'API is unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

