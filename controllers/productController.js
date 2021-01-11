const productModel = require('../models/productModel');
const { validationResult } = require('express-validator');

const PRODUCT_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  // get search
  const searchText = req.query.name || null;

  const {
    listProduct, 
    page, 
    lastPage 
  } = await productModel.list(req.query.page, PRODUCT_PER_PAGE, searchText, null, null);

  res.render('product/list', { 
    title: 'Sản phẩm',
    listProduct,
    pageLink: '/product',
    searchText,
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1,
    haveNextPage: page < lastPage,
    isProductPage: true
  });
}

module.exports.get_delete = async (req, res, next) => {
  if (await productModel.delete(req.params._id))
    return res.redirect (`/product?page=${req.query.page}`);
  return next();
}

module.exports.get_add = async (req, res, next) => {
  res.render('product/add', { errors: req.flash('errors') , isProductPage: true });
}

module.exports.post_add = async (req, res, next) => {
  const files = req.files.image;

  const {errors} = validationResult(req);

  if (errors.length) {
    req.flash('errors', errors);
    res.redirect('/product/add');
  } else {
    await productModel.add(req.body, files);
    res.redirect('/product');
  }
}

module.exports.get_edit = async (req, res, next) => {
  const product = await productModel.findOne(req.params._id);
  if (product) {
    return res.render('product/edit', {
      product,
      errors: req.flash('errors'),
      isProductPage: true
    });
  } else {
    next();
  }
}

module.exports.post_edit = async (req, res, next) => {
  let files = null;
  if (req.files != null && req.files.image != null) {
    files = req.files.image;
  }

  const {errors} = validationResult(req);

  if (errors.length) {
    req.flash('errors', errors);
    res.redirect(`/product/edit/${req.params._id}`)
  } else {
    const result = await productModel.update(req.body, files, req.params._id);
    if (result)
      return res.redirect('/product');
    return next();
  }

}