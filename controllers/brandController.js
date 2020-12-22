const productModel = require('../models/productModel');
const { ObjectId } = require('mongodb');

const PRODUCT_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  // get search text
  const searchText = req.query.name || null;

  const { 
    listBrand, 
    listCategory, 
    listProduct, 
    page, 
    lastPage 
  } = await productModel.list(req.query.page, PRODUCT_PER_PAGE, searchText, null, req.params._id);

  const brand = listBrand.find(brand => brand._id.equals(ObjectId(req.params._id)));

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