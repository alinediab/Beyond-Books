// routes/appliesRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/appliesController');
const auth = require('../middleware/auth');

router.post('/', auth, ctrl.apply);
router.delete('/:studentID/:internshipID', auth, ctrl.withdraw);
router.get('/student/:studentID', auth, ctrl.listByStudent);

module.exports = router;
