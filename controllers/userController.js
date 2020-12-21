const userModel = require('../models/userModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const { ObjectId } = require('mongodb');


const USER_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  // get count
  const count = await userModel.count();

  // get last page
  const lastPage = Math.ceil(count / USER_PER_PAGE);

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
    title: 'User details',
    pageLink: '/user'
  }) 
}

module.exports.ban = async (req, res, next) => {
  if(req.params._id) {
    await userModel.ban(req.params._id);
    res.redirect('/user/' + req.params._id);
  } else {
    next();
  }
}

module.exports.unban = async (req, res, next) => {
  if(req.params._id) {
    await userModel.unban(req.params._id);
    res.redirect('/user/' + req.params._id);
  } else {
    next();
  }
}