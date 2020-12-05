const productModel = require('../models/productModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const { ObjectId } = require('mongodb');
const db = require('../db');

const PRODUCT_PER_PAGE = 5;

module.exports.index = async (req, res, next) => {

  const brandPromise = brandModel.list();
  const categoryPromise = categoryModel.list();

  // get product count
  const count = await productModel.count();

  // get last page index
  const lastPage = Math.ceil(count / PRODUCT_PER_PAGE);

  // get search
  const searchText = req.query.name || null;
  const filter = searchText == null ? {} : { $or:[
                                                  { $text: { $search: searchText } },
                                                  { name: { $regex: searchText, $options: 'i' } }
                                                ]};

  // get current page
  let page = parseInt(req.query.page) || 1;
  page = page < 0 ? 1 : page;
  page = page > lastPage ? lastPage : page;
  

  const productPromise = productModel.list(filter, 
                                            searchText == null ? page - 1 : 0,
                                            searchText == null ? PRODUCT_PER_PAGE : 0);

  const listBrand = await brandPromise;
  const listCategory = await categoryPromise;
  const listProduct = await productPromise;

  listProduct.map(product => {
      product.brand = listBrand.find(brand => brand._id.equals(product.brand)).name;
      product.category = listCategory.find(category => category._id.equals(product.category)).name;
      return product; 
  });

  res.render('product/index', { 
    title: 'Products',
    listProduct,
    listCategory,
    listBrand,
    pageLink: '/product',
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1 && searchText == null,
    haveNextPage: page < lastPage && searchText == null
  });
}

module.exports.get_delete = async (req, res, next) => {
  if(req.params._id) {
    res.render('product/delete', {
      _id: req.params._id
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
  const brandPromise = brandModel.list();
  const categoryPromise = categoryModel.list();

  const listBrand = await brandPromise;
  const listCategory = await categoryPromise;

  res.render('product/add', { listBrand, listCategory });
}

module.exports.post_add = async (req, res, next) => {
  const files = req.files.image;
  await productModel.add(req.body, files);

  res.redirect('/product');
}

module.exports.get_edit = async (req, res, next) => {
  if(req.params._id) {
    const productPromise = productModel.findOne({ _id: ObjectId(req.params._id) });
    const brandPromise = brandModel.list();
    const categoryPromise = categoryModel.list();

    const product = await productPromise;
    const listBrand = await brandPromise;
    const listCategory = await categoryPromise;

    res.render('product/edit', {
      product,
      listBrand,
      listCategory
    });
  } else {
    next();
  }
}

module.exports.post_edit = async (req, res, next) => {
  if(req.params._id) {
    let files = null;
    if (req.files != null && req.files.image != null) {
      files = req.files.image;
    }
    
    await productModel.update(req.body, files, req.params._id);
    res.redirect("/product");
  } else {
    next();
  }
}