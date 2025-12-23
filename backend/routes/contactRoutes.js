// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Contact form submission (public endpoint)
router.post('/', contactController.sendContactMessage);

module.exports = router;


