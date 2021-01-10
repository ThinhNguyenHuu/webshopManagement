const productModel = require('../models/productModel');
const { ObjectId } = require('mongodb');

const PRODUCT_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  // get search text
  const searchText = req.query.name || null;

  const { 
    listProduct, 
    page, 
    lastPage 
  } = await productModel.list(req.query.page, PRODUCT_PER_PAGE, searchText, null, req.params._id);

  const brand = res.locals.listBrand.find(brand => ObjectId(brand._id).equals(ObjectId(req.params._id)));

  res.render('product/index', { 
    title: brand.name,
    listProduct,
    pageLink: '/brand/' + brand._id,
    searchText,
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1,
    haveNextPage: page < lastPage,
    isBrandPage: true
  });
}