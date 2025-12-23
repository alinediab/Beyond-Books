// routes/clubRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clubController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', ctrl.listClubs);
router.get('/:id', ctrl.getClub);
router.post('/', auth, requireRole('studentAffair'), ctrl.createClub);
router.put('/:id', auth, requireRole('studentAffair'), ctrl.updateClub);
router.delete('/:id', auth, requireRole('studentAffair'), ctrl.deleteClub);

module.exports = router;
