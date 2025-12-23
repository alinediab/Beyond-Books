// routes/submitsRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/submitsController');
const auth = require('../middleware/auth');

router.post('/', auth, ctrl.submit);
router.delete('/:studentID/:professorID', auth, ctrl.remove);

module.exports = router;
