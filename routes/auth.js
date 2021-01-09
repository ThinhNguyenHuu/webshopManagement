const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const passport = require('../passport/index');
const {
  emailValidator, 
  updatePasswordValidator,
  registerValidator
} = require('../middlewares/validationMiddleware');

router.get('/login', controller.get_login);
router.post('/login', (req, res, next) => {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { 
      req.flash('error', info.message); 
      if (info.requireActive)
        return res.redirect('/auth/register/verify/' + info.id);
      return res.redirect('/auth/login'); 
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/'); 
    });
  })(req, res, next);
});

router.get('/register', controller.get_register);
router.post('/register', registerValidator, controller.post_register);

router.get('/register/verify/:_id', (req, res, next) => { res.locals.isRegister = true; next(); }, controller.get_verify);
router.post('/register/verify/:_id', (req, res, next) => { res.locals.isRegister = true; next(); }, controller.post_verify);

router.post('/forgetPassword', emailValidator, controller.forgetPassword);

router.get('/forgetPassword/verify/:_id', controller.get_verify);
router.post('/forgetPassword/verify/:_id', controller.post_verify);

router.get('/forgetPassword/update/:_id', controller.get_updatePassword);
router.post('/forgetPassword/update/:_id', updatePasswordValidator, controller.post_updatePassword);

router.get('/logout', controller.logout);

module.exports = router;
