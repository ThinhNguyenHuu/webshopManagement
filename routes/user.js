const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router.get('/', controller.index);

router.get('/:_id', controller.details);

router.get('/ban/:_id', controller.ban);

router.get('/unban/:_id', controller.unban);

module.exports = router;
