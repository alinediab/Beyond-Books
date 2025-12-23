// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eventController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', ctrl.listEvents);
router.get('/club/:clubId', ctrl.getEventsByClub);
router.get('/:id', ctrl.getEvent);
router.post('/', auth, requireRole('studentAffair'), ctrl.createEvent);
router.put('/:id', auth, requireRole('studentAffair'), ctrl.updateEvent);
router.delete('/:id', auth, requireRole('studentAffair'), ctrl.deleteEvent);

module.exports = router;