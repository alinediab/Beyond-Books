// routes/managesRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/managesController');
const auth = require('../middleware/auth');

router.post('/', auth, ctrl.add);
router.delete('/:staffID/:recordID', auth, ctrl.remove);

module.exports = router;
