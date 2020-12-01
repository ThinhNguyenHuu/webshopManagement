const productModel = require('../models/productModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const { ObjectId } = require('mongodb');

module.exports.index = async (req, res, next) => {
    const list = await productModel.list();
    res.render('index', { list });
}

module.exports.get_delete = async (req, res, next) => {
  if(req.params._id) {
    res.render('delete', {
      _id: req.params._id
    })
  } else {
    next();
  }
}

module.exports.post_delete = async (req, res, next) => {
  if(req.params._id) {
    await productModel.delete(req.params._id);
    res.redirect ("/");
  } else {
    next();
  }
}

module.exports.get_add = async (req, res, next) => {
  const brandPromise = brandModel.list();
  const categoryPromise = categoryModel.list();

  const listBrand = await brandPromise;
  const listCategory = await categoryPromise;

  res.render('add', { listBrand, listCategory });
}

module.exports.post_add = async (req, res, next) => {
  if(!req.files || !req.files.image) {
    const brandPromise = brandModel.list();
    const categoryPromise = categoryModel.list();

    const listBrand = await brandPromise;
    const listCategory = await categoryPromise;

    return res.render('add', {
      listBrand,
      listCategory,
      error: 'Image is required'
    })
  }

  const files = req.files.image;
  await productModel.add(req.body, files);

  res.redirect('/');
}

module.exports.get_edit = async (req, res, next) => {
  if(req.params._id) {
    const productPromise = productModel.findOne({ _id: ObjectId(req.params._id) });
    const brandPromise = brandModel.list();
    const categoryPromise = categoryModel.list();

    const product = await productPromise;
    const listBrand = await brandPromise;
    const listCategory = await categoryPromise;

    res.render('edit', {
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
    res.redirect("/");
  } else {
    next();
  }
}