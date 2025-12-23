// routes/internshipRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/internshipController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', ctrl.listInternships);
router.get('/:id', ctrl.getInternship);
router.post('/', auth, requireRole('studentAffair'), ctrl.createInternship);
router.put('/:id', auth, requireRole('studentAffair'), ctrl.updateInternship);
router.delete('/:id', auth, requireRole('studentAffair'), ctrl.deleteInternship);

module.exports = router;
