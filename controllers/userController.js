const userModel = require('../models/userModel');
const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');


const USER_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  const {
    listUser,
    page,
    lastPage
  } = await userModel.list(req.query.page, USER_PER_PAGE);

  res.render('user/list', {
    title: 'Người dùng',
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
  const user = await userModel.findOne(req.params._id);
  if (!user)
    return next();
  res.render('user/details', {
    userEdit: user,
    title: 'Thông tin người dùng',
    pageLink: '/user',
    isNotMyAccount: !(user._id.equals(res.locals.user._id)),
    isUserPage: true
  }) 
}

module.exports.get_add = async (req, res, next) => {
  if (!res.locals.user.superadmin)
    return next();

  res.render('user/add', {
    errors: req.flash('errors'),
    isUserPage: true
  });
}

module.exports.post_add = async (req, res, next) => {
  if (!res.locals.user.superadmin)
    return next();

  const {errors} = validationResult(req);
  if (errors.length) {
    req.flash('errors', errors);
    return res.redirect('/user/add');
  }

  const id = await userModel.add(req.body);
  res.redirect(`/user/${id}`);
}

module.exports.ban = async (req, res, next) => {
  const editUser = await userModel.findOne(req.params._id);

  if (editUser.superadmin)
    return next();

  if (editUser.is_admin && !res.locals.user.superadmin)
    return next();

  await userModel.ban(req.params._id);
  res.redirect('/user/' + req.params._id);
}

module.exports.unban = async (req, res, next) => {
  const editUser = await userModel.findOne(req.params._id);

  if (editUser.superadmin)
    return next();

  if (editUser.is_admin && !res.locals.user.superadmin)
    return next();

  await userModel.unban(req.params._id);
  res.redirect('/user/' + req.params._id);
}

module.exports.get_edit = async (req, res, next) => {
  if (!res.locals.user._id.equals(ObjectId(req.params._id)))
    return next();

  const user = await userModel.findOne(req.params._id);
  res.render('user/edit', {
    user: user,
    errors: req.flash('errors'),
    isUserPage: true
  });
}

module.exports.post_edit = async (req, res, next) => {
  if (!res.locals.user._id.equals(ObjectId(req.params._id)))
    return next();
    
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