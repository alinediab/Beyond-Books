// routes/lostAndFoundRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lostAndFoundController');
const auth = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.delete);

module.exports = router;
