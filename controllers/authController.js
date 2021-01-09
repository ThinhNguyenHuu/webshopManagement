const userModel = require('../models/userModel');
const { validationResult } = require('express-validator');
const mailer = require('../mailer');

module.exports.get_login = async (req, res, next) => {
  res.render('auth/login', { 
    layout: false,
    error: req.flash('error')
  });
}

module.exports.get_register = async (req, res, next) => {
  res.render('auth/register', {
    layout: false,
    errors: req.flash('errors')
  });
}

module.exports.post_register = async (req, res, next) => {
  const {errors} = validationResult(req);
  if (errors.length) {
    req.flash('errors', errors);
    return res.redirect('/auth/register');
  }

  const result = await userModel.register(req.body);
  console.log(result);
  if (result) {
    res.redirect('/auth/verify/' + result.id);
  } else {
    req.flash('errors', [ 'Không thể gửi mã xác nhận qua email.' ]);
    res.redirect('/auth/register');
  }
}

module.exports.logout = async (req, res, next) => {
  req.logout();
  res.redirect('/auth/login');
}

module.exports.forgetPassword = async (req, res, next) => {

  const {errors} = validationResult(req);
  if (errors.length) {
    req.flash('error', errors[0]);
    return res.redirect('/auth/login');
  } 

  try {
    const user = await userModel.findByEmail(req.body.email);
    await mailer.sendVerificationCode(user.email, user.verification);
    return res.redirect(`/auth/forgetPassword/verify/${user._id}`);
  } catch (e) {
    req.flash('error', 'Không thể gửi mã xác nhận đến email.');
    return res.redirect('/auth/login');
  }
}

module.exports.get_verify = async (req, res, next) => {
  res.render('auth/verify', {
    layout: false,
    userId: req.params._id,
    error: req.flash('error')
  });
}

module.exports.post_verify = async (req, res, next) => {
  const checkVerificationCode = await userModel.checkVerificationCode(req.body.code, req.params._id);
  const uri = res.locals.isRegister ? 'register' : 'forgetPassword';
  if (!checkVerificationCode) {
    req.flash('error', 'Sai mã xác nhận.');
    return res.redirect(`/auth/${uri}/verify/${req.params._id}`);
  } else {
    if (res.locals.isRegister) {
      await userModel.verifyUser(req.params._id);
      return res.redirect('/auth/login');
    } else {
      return res.redirect(`/auth/forgetPassword/update/${req.params._id}`);
    }
  }
}

module.exports.get_updatePassword = async (req, res, next) => {
  res.render('auth/updatePassword', {
    layout: false,
    userId: req.params._id,
    errors: req.flash('errors')
  });
}

module.exports.post_updatePassword = async (req, res, next) => {
  const {errors} = validationResult(req);
  if (errors.length) {
    req.flash('errors', errors);
    res.redirect(`/auth/forgetPassword/update/${req.params._id}`);
  }

  await userModel.updatePassword(req.body.password, req.params._id);
  res.redirect('/auth/login');
}