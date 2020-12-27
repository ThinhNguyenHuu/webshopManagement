const express = require('express');
const router = express.Router();
const controller = require('../controllers/statisticController');

router.get('/sales', controller.sales);

router.get('/topTenSeller', controller.topTenSeller);

module.exports = router;