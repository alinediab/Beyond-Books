// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleMiddleware');

// Public endpoints
router.get('/', studentController.listStudents);
router.get('/:id', studentController.getStudent);

// Protected operations:
// create often handled by registration; still available for admin
router.post('/', auth, requireRole('admin'), studentController.createStudent);

// Update allowed by owner (student) or admin
router.put('/:id', auth, (req, res, next) => {
  // owner or admin check
  if (req.user.role === 'admin' || (req.user.role === 'student' && req.user.id == req.params.id)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, studentController.updateStudent);

// Delete (admin only)
router.delete('/:id', auth, requireRole('admin'), studentController.deleteStudent);

// student-specific actions
router.post('/:id/join', auth, (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.role === 'student' && req.user.id == req.params.id)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, studentController.joinClub);

router.post('/:id/attend', auth, (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.role === 'student' && req.user.id == req.params.id)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, studentController.attendEvent);

router.get('/:id/applications', auth, (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.role === 'student' && req.user.id == req.params.id)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, studentController.listApplications);

router.get('/:id/clubs', auth, (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.role === 'student' && req.user.id == req.params.id)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, studentController.getJoinedClubs);

router.get('/:id/events', auth, (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.role === 'student' && req.user.id == req.params.id)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, studentController.getAttendedEvents);

router.get('/:id/research-applications', auth, (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.role === 'student' && req.user.id == req.params.id)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, studentController.getResearchApplications);

router.get('/:id/stats', auth, (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.role === 'student' && req.user.id == req.params.id)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, studentController.getStudentStats);

module.exports = router;
