// routes/attendsRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendsController');
const auth = require('../middleware/auth');

router.post('/', auth, ctrl.attend);
router.delete('/:studentID/:eventID', auth, ctrl.removeAttend);
router.get('/event/:eventID', auth, ctrl.getEventAttendees);

module.exports = router;
