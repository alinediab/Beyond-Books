// routes/conductsRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/conductsController');
const auth = require('../middleware/auth');

router.get('/', auth, ctrl.list);
router.post('/', auth, ctrl.addConduct);
router.put('/:studentID/:projectID', auth, ctrl.updateStatus);
router.delete('/:studentID/:projectID', auth, ctrl.removeConduct);

module.exports = router;
