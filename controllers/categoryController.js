const productModel = require('../models/productModel');
const { ObjectId } = require('mongodb');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');

const PRODUCT_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  // get search text
  const searchText = req.query.name || null;

  // get brand id
  const brandId = req.query.brand || 'All';

  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    productModel.list(req.query.page, PRODUCT_PER_PAGE, searchText, req.params._id, brandId)
  ])

  const listBrand = result[0];
  const listCategory = result[1];
  const { listProduct, page, lastPage } = result[2];

  // get category
  const category = listCategory.find(category => ObjectId(category._id).equals(ObjectId(req.params._id)));


  // get list brand in category
  const listBrandInCategory = listBrand.filter(brand => {
    for (const item of brand.category) {
      if (ObjectId(item).equals(category._id)) return true;
    }
    return false;
  });


  res.render('product/index', { 
    title: category.name,
    category,
    brandId,
    listBrandInCategory,
    listProduct,
    listCategory,
    listBrand,
    pageLink: '/category/' + category._id,
    searchText,
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1,
    haveNextPage: page < lastPage,
    isCategoryPage: true
  });
}