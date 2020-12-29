const productModel = require('../models/productModel');
const { ObjectId } = require('mongodb');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');

const PRODUCT_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  // get search text
  const searchText = req.query.name || null;

  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    productModel.list(req.query.page, PRODUCT_PER_PAGE, searchText, null, req.params._id)
  ])

  const listBrand = result[0];
  const listCategory = result[1];
  const { listProduct, page, lastPage } = result[2];

  const brand = listBrand.find(brand => ObjectId(brand._id).equals(ObjectId(req.params._id)));

  res.render('product/index', { 
    title: brand.name,
    listProduct,
    listCategory,
    listBrand,
    pageLink: '/brand/' + brand._id,
    searchText,
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1,
    haveNextPage: page < lastPage
  });
}