// routes/researchProjectRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/researchProjectController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', ctrl.list);
router.get('/professor/:id', auth, (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.role === 'professor' && req.user.id == req.params.id)) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, ctrl.getByProfessor);
router.get('/:id', ctrl.get);
router.post('/', auth, requireRole('professor','admin'), ctrl.create);
router.put('/:id', auth, requireRole('professor','admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin','professor'), ctrl.delete);

module.exports = router;
