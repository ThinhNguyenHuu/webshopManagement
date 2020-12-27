const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');

router.get('/', controller.index);

router.get('/:_id', controller.details);

router.get('/:_id/updateStatus/:type', controller.updateStatus);

module.exports = router;
