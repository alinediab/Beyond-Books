// routes/recommendsRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recommendsController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', auth, requireRole('studentAffair'), ctrl.list);
router.post('/', auth, requireRole('studentAffair'), ctrl.recommend);
router.delete('/:professorID/:internshipID', auth, requireRole('studentAffair'), ctrl.remove);

module.exports = router;
