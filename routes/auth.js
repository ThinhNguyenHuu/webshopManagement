const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const passport = require('../passport/index');

router.get('/login', controller.get_login);

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: false
}));

router.get('/logout', controller.logout);

module.exports = router;
