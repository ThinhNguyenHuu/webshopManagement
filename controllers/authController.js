const userModel = require('../models/userModel');
const { validationResult } = require('express-validator');
const mailer = require('../mailer');

module.exports.get_login = async (req, res, next) => {
  res.render('auth/login', { 
    layout: false,
    error: req.flash('error')
  });
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
  if (!checkVerificationCode) {
    req.flash('error', 'Sai mã xác nhận.');
    return res.redirect(`/auth/forgetPassword/verify/${req.params._id}`);
  }

  res.redirect(`/auth/forgetPassword/update/${req.params._id}`);
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