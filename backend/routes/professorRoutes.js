// routes/professorRoutes.js
const express = require('express');
const router = express.Router();
const prof = require('../controllers/professorController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', prof.listProfessors);
router.get('/:id', prof.getProfessor);
router.get('/:id/project-applications', auth, (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.role === 'professor' && req.user.id == req.params.id)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, prof.getProjectApplications);
router.get('/:id/stats', prof.getProfessorStats);
router.post('/', auth, requireRole('admin'), prof.createProfessor);
router.put('/:id', auth, requireRole('professor','admin'), prof.updateProfessor);
router.delete('/:id', auth, requireRole('admin'), prof.deleteProfessor);

module.exports = router;