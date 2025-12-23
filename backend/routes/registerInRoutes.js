// routes/registerInRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/registerInController');
const auth = require('../middleware/auth');

router.post('/', auth, ctrl.register);
router.delete('/:studentID/:semesterID', auth, ctrl.unregister);

module.exports = router;
