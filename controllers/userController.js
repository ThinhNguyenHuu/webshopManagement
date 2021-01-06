const userModel = require('../models/userModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');


const USER_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  const {
    listBrand,
    listCategory,
    listUser,
    page,
    lastPage
  } = await userModel.list(req.query.page, USER_PER_PAGE);

  res.render('user/index', {
    title: 'Người dùng',
    listBrand,
    listCategory,
    listUser,
    pageLink: '/user',
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1,
    haveNextPage: page < lastPage,
    isUserPage: true
  });
}

module.exports.details = async (req, res, next) => {
  const result = await Promise.all([
    categoryModel.list(),
    brandModel.list(),
    userModel.findOne(req.params._id)
  ]);

  res.render('user/details', {
    listCategory: result[0],
    listBrand: result[1],
    userEdit: result[2],
    title: 'Thông tin người dùng',
    pageLink: '/user',
    isNotMyAccount: !(result[2]._id.equals(res.locals.user._id))
  }) 
}

module.exports.ban = async (req, res, next) => {
  if (req.params._id) {
    await userModel.ban(req.params._id);
    res.redirect('/user/' + req.params._id);
  } else {
    next();
  }
}

module.exports.unban = async (req, res, next) => {
  if (req.params._id) {
    await userModel.unban(req.params._id);
    res.redirect('/user/' + req.params._id);
  } else {
    next();
  }
}

module.exports.get_edit = async (req, res, next) => {
  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    userModel.findOne(req.params._id)
  ]);

  res.render('user/edit', {
    listBrand: result[0],
    listCategory: result[1],
    user: result[2],
    errors: req.flash('errors'),
    isUserPage: true
  });
}

module.exports.post_edit = async (req, res, next) => {
  let file = null;
  if (req.files != null && req.files.image != null)
    file = req.files.image;

  const { errors } = validationResult(req);

  if (errors.length) {
    req.flash('errors', errors);
    res.redirect(`/user/edit/${req.params._id}`);
  } else {
    await userModel.update(req.body, file, req.params._id);
    res.redirect('/user/' + req.params._id);
  }

}