// routes/index.js
const express = require('express');
const router = express.Router();

// Health check (before other routes)
router.use('/health', require('./healthRoutes'));

// Unified auth routes (handles student, professor, staff via role parameter)
router.use('/auth', require('./authRoutes'));

router.use('/students', require('./studentRoutes'));
router.use('/professors', require('./professorRoutes'));
router.use('/studentaffairsofficer', require('./studentAffairsOfficerRoutes'));

router.use('/clubs', require('./clubRoutes'));
router.use('/events', require('./eventRoutes'));
router.use('/internships', require('./internshipRoutes'));
router.use('/research', require('./researchProjectRoutes'));

router.use('/joins', require('./joinsRoutes'));
router.use('/attends', require('./attendsRoutes'));
router.use('/applies', require('./appliesRoutes'));
router.use('/conducts', require('./conductsRoutes'));
router.use('/recommends', require('./recommendsRoutes'));
router.use('/submits', require('./submitsRoutes'));
router.use('/manages', require('./managesRoutes'));
router.use('/register', require('./registerInRoutes'));
router.use('/lostfound', require('./lostAndFoundRoutes'));
router.use('/contact', require('./contactRoutes'));

module.exports = router;
