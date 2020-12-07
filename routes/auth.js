const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.get('/login', controller.get_login);

router.post('/login', controller.post_login);

module.exports = router;
