const userModel = require('../models/userModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');


const USER_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  // get count
  const count = await userModel.count();

  // get last page
  let lastPage = Math.ceil(count / USER_PER_PAGE);
  lastPage = lastPage < 1 ? 1 : lastPage;

  // get current page
  let page = parseInt(req.query.page) || 1;
  page = page < 0 ? 1 : page;
  page = page > lastPage ? lastPage : page;

  // get data
  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    userModel.list(page - 1, USER_PER_PAGE)
  ]);


  res.render('user/index', {
    title: 'User',
    listBrand: result[0],
    listCategory: result[1],
    listUser: result[2],
    pageLink: '/user',
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1,
    haveNextPage: page < lastPage
  });
}

module.exports.details = async (req, res, next) => {
  const result = await Promise.all([
    categoryModel.list(),
    brandModel.list(),
    userModel.findOne({_id: ObjectId(req.params._id)})
  ]);

  res.render('user/details', {
    listCategory: result[0],
    listBrand: result[1],
    user: result[2],
    title: 'Thông tin người dùng',
    pageLink: '/user',
    isNotMyCount: !(result[2]._id.equals(res.locals.user._id))
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
  const result = Promise.all([
    brandModel.list(),
    categoryModel.list(),
    userModel.findOne({_id: ObjectId(req.params._id)})
  ]);

  res.render('user/edit', {
    listBrand: result[0],
    listCategory: result[1],
    user: result[2]
  });
}

module.exports.post_edit = async (req, res, next) => {
  let file = null;
  if (req.files != null && req.files.image != null)
    file = req.files.image;

  const user = await userModel.findOne({_id: ObjectId(req.params._id)});

  // Validation
  const errors = [];
  const checkPassword = await bcrypt.compare(req.body.password, user.password);
  if (!checkPassword)
    errors.push('Sai mật khẩu.');

   if (req.body.newPassword != req.body.newPasswordAgain) {
    errors.push('Nhập lại mật khẩu mới không khớp.');
  } else {
    req.body.newPassword = user.password;
  }

  if (errors.length > 0) {
    const result = Promise.all([
      brandModel.list(),
      categoryModel.list(),
      userModel.findOne({_id: ObjectId(req.params._id)})
    ]);
  
    res.render('user/edit', {
      listBrand: result[0],
      listCategory: result[1],
      user: result[2],
      errors
    });
  } else {
    await userModel.update(req.body, file, req.params._id);
    res.redirect('/user/' + req.params._id);
  }

}