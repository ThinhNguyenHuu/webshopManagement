const { ObjectId } = require('mongodb');
const db = require('../db');

module.exports.get_login = async (req, res, next) => {
  res.render('auth/login', { layout: false });
}

module.exports.logout = async (req, res, next) => {
  req.logout();
  res.redirect('/');
}