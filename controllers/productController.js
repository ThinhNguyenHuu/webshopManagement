const productModel = require('../models/productModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const { validationResult } = require('express-validator');

const PRODUCT_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  // get search
  const searchText = req.query.name || null;

  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    productModel.list(req.query.page, PRODUCT_PER_PAGE, searchText, null, null)
  ])

  const {listProduct, page, lastPage } = result[2];

  res.render('product/index', { 
    title: 'Sản phẩm',
    listProduct,
    listBrand: result[0],
    listCategory: result[1],
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
  if(req.params._id) {
    const {listBrand, listCategory} = await getBrandAndCategory();
    res.render('product/delete', {
      _id: req.params._id,
      listBrand,
      listCategory,
      isProductPage: true
    })
  } else {
    next();
  }
}

module.exports.post_delete = async (req, res, next) => {
  if(req.params._id) {
    await productModel.delete(req.params._id);
    res.redirect ("/product");
  } else {
    next();
  }
}

module.exports.get_add = async (req, res, next) => {
  const { listBrand, listCategory } = await getBrandAndCategory();
  res.render('product/add', { listBrand, listCategory, errors: req.flash('errors') , isProductPage: true });
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
  if (req.params._id) {
    const result = await Promise.all([
      productModel.findOne(req.params._id),
      brandModel.list(),
      categoryModel.list()
    ])

    const product = result[0];
    const listBrand = result[1];
    const listCategory = result[2];

    res.render('product/edit', {
      product,
      listBrand,
      listCategory,
      errors: req.flash('errors'),
      isProductPage: true
    });
  } else {
    next();
  }
}

module.exports.post_edit = async (req, res, next) => {
  if (req.params._id) {
    let files = null;
    if (req.files != null && req.files.image != null) {
      files = req.files.image;
    }

    const {errors} = validationResult(req);

    if (errors.length) {
      req.flash('errors', errors);
      res.redirect(`/product/edit/${req.params._id}`)
    } else {
      await productModel.update(req.body, files, req.params._id);
      res.redirect('/product');
    }
    
  } else {
    next();
  }
}

const getBrandAndCategory = async () => {
  const result = await Promise.all([brandModel.list(), categoryModel.list()]);
  return {
    listBrand: result[0],
    listCategory: result[1]
  };
}