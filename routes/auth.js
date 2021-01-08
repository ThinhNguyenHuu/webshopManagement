const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const passport = require('../passport/index');
const { emailValidator, updatePasswordValidator } = require('../middlewares/validationMiddleware');

router.get('/login', controller.get_login);

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

router.post('/forgetPassword', emailValidator, controller.forgetPassword);

router.get('/forgetPassword/verify/:_id', controller.get_verify);
router.post('/forgetPassword/verify/:_id', controller.post_verify);

router.get('/forgetPassword/update/:_id', controller.get_updatePassword);
router.post('/forgetPassword/update/:_id', updatePasswordValidator, controller.post_updatePassword);

router.get('/logout', controller.logout);

module.exports = router;
