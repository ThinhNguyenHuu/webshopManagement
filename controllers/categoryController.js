const productModel = require('../models/productModel');
const { ObjectId } = require('mongodb');

const PRODUCT_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  // get search text
  const searchText = req.query.name || null;

  // get brand id
  const brandId = req.query.brand || 'All';

  const { 
    listBrand, 
    listCategory, 
    listProduct, 
    page, 
    lastPage 
  } = await productModel.list(req.query.page, PRODUCT_PER_PAGE, searchText, req.params._id, brandId);

  // get category
  const category = listCategory.find(category => category._id.equals(ObjectId(req.params._id)));


  // get list brand in category
  const listBrandInCategory = listBrand.filter(brand => {
    for (const item of brand.category) {
      if (item.equals(category._id)) return true;
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
    haveNextPage: page < lastPage
  });
}