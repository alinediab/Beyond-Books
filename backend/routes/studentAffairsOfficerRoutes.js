const express = require('express');
const router = express.Router();
const { getOfficers, getOfficerById, updateOfficer, deleteOfficer, getOfficerStats } = require('../controllers/studentAffairsOfficerController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleMiddleware');

// Public endpoints
router.get('/:id', getOfficerById);
router.get('/', getOfficers);

// Get stats (protected - owner or admin only)
router.get('/:id/stats', auth, (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.role === 'studentAffair' && req.user.id == req.params.id)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, getOfficerStats);

// Protected: Update allowed by owner (studentAffair) or admin
router.put('/:id', auth, (req, res, next) => {
  // owner check - convert both to strings for comparison
  const userId = String(req.user.id || '');
  const paramId = String(req.params.id || '');
  if (req.user.role === 'admin' || (req.user.role === 'studentAffair' && userId === paramId)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, updateOfficer);

// Delete (studentAffair only)
router.delete('/:id', auth, requireRole('studentAffair'), deleteOfficer);

module.exports = router;
