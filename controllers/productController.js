const productModel = require('../models/productModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const { ObjectId } = require('mongodb');

module.exports.index = async (req, res, next) => {
    const productPromise = productModel.list();
    const brandPromise = brandModel.list();
    const categoryPromise = categoryModel.list();

    const listProduct = await productPromise;
    const listBrand = await brandPromise;
    const listCategory = await categoryPromise;

    listProduct.map(product => {
        product.brand = listBrand.find(brand => brand._id.equals(product.brand)).name;
        product.category = listCategory.find(category => category._id.equals(product.category)).name;
        return product;
    });

    res.render('product/index', { listProduct });
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