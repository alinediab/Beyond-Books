// routes/joinsRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/joinsController');
const auth = require('../middleware/auth');

router.post('/', auth, ctrl.joinClub);
router.delete('/:studentID/:clubID', auth, ctrl.removeJoin);
router.get('/club/:clubID', auth, ctrl.getClubMembers);

module.exports = router;
