const express = require('express');
const router = express.Router();
const controller = require('../controllers/brandController');

router.get('/:_id', controller.index);

module.exports = router;
