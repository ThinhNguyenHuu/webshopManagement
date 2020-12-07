const e = require('express');
const { ObjectId } = require('mongodb');
const db = require('../db');

module.exports.get_login = async (req, res, next) => {
  res.render('auth/login', { layout: false });
}

module.exports.post_login = async (req, res, next) => {

  if (req.body.username.localeCompare('admin') != 0 &&
      req.body.password.localeCompare('admin') != 0) {
        res.render('auth/login', { layout: false, error: 'Wrong username or password' });
      } else {
        res.redirect('/');
      }
}