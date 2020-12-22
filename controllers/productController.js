const productModel = require('../models/productModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const { ObjectId } = require('mongodb');
const db = require('../db');

const PRODUCT_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  const brandPromise = brandModel.list();
  const categoryPromise = categoryModel.list();

  // get search
  const searchText = req.query.name || null;
  const filter = searchText == null ? {} : { $or:[
                                                  { $text: { $search: searchText } },
                                                  { name: { $regex: searchText, $options: 'i' } }
                                                ]};

  // get count
  const count = await productModel.count(filter);

  // get last page
  let lastPage = Math.ceil(count / PRODUCT_PER_PAGE);
  lastPage = lastPage < 1 ? 1 : lastPage;

  // get current page
  let page = parseInt(req.query.page) || 1;
  page = page < 0 ? 1 : page;
  page = page > lastPage ? lastPage : page;
  

  const productPromise = productModel.list(filter, page - 1, PRODUCT_PER_PAGE);

  const listBrand = await brandPromise;
  const listCategory = await categoryPromise;
  const listProduct = await productPromise;

  listProduct.map(product => {
      product.brand = listBrand.find(brand => brand._id.equals(product.brand)).name;
      product.category = listCategory.find(category => category._id.equals(product.category)).name;
      return product; 
  });

  res.render('product/index', { 
    title: 'Sản phẩm',
    listProduct,
    listCategory,
    listBrand,
    pageLink: '/product',
    searchText,
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1,
    haveNextPage: page < lastPage
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
  const result = await Promise.all([ brandModel.list(), categoryModel.list() ]);
  const listBrand = result[0];
  const listCategory = result[1];

  res.render('product/add', { listBrand, listCategory });
}

module.exports.post_add = async (req, res, next) => {
  const files = req.files.image;
 
  const errors = [];

  const duplicatedProduct = await productModel.findOne({name: req.body.name});
  if (duplicatedProduct) 
    errors.push('Tên sản phẩm đã bị trùng.');

  if (isNaN(req.body.price) || req.body.price < 0) 
    errors.push('Giá không hợp lệ.');
  
  if (isNaN(req.body.discount) || req.body.discount < 0 || req.body.discount > 100)
    errors.push('Khuyến mãi phải lớn hơn 0 và bé hơn 100.');

  if (errors.length > 0) {
    const result = await Promise.all([ brandModel.list(), categoryModel.list() ]);

    res.render('product/add', {
      listBrand: result[0],
      listCategory: result[1],
      errors
    });
  } else {
    await productModel.add(req.body, files);
    res.redirect('/product');
  }
}

module.exports.get_edit = async (req, res, next) => {
  if (req.params._id) {
    const result = await Promise.all([
      productModel.findOne({_id: ObjectId(req.params._id)}),
      brandModel.list(),
      categoryModel.list()
    ])

    const product = result[0];
    const listBrand = result[1];
    const listCategory = result[2];

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
  if (req.params._id) {
    let files = null;
    if (req.files != null && req.files.image != null) {
      files = req.files.image;
    }

    // Validation
    const errors = [];
    const duplicatedProduct = await productModel.findOne({$and: [ 
                                                            { name: req.body.name },
                                                            { _id: { $ne: ObjectId(req.params._id) } } ]});
    if (duplicatedProduct) 
      errors.push('Tên sản phẩm đã bị trùng.');

    if (isNaN(req.body.price) || req.body.price < 0) 
      errors.push('Giá không hợp lệ.');
    
    if (isNaN(req.body.discount) || req.body.discount < 0 || req.body.discount > 100)
      errors.push('Khuyến mãi phải lớn hơn 0 và bé hơn 100.');

    if (errors.length > 0) {
      const result = await Promise.all([
        productModel.findOne({_id: ObjectId(req.params._id)}),
        brandModel.list(),
        categoryModel.list()
      ]);

      res.render('product/edit', {
        product: result[0],
        listBrand: result[1],
        listCategory: result[2],
        errors
      });
    }
    else {
      await productModel.update(req.body, files, req.params._id);
      res.redirect('/product');
    }
    
  } else {
    next();
  }
}