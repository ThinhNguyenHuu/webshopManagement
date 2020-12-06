const productModel = require('../models/productModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const { ObjectId } = require('mongodb');
const db = require('../db');

const PRODUCT_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  const categoryPromise = categoryModel.list();
  const brandPromise = brandModel.list();

  const listCategory = await categoryPromise;
  const category = listCategory.find(category => category._id.equals(ObjectId(req.params._id)));

  // get search text
  const searchText = req.query.name || null;
  
  // get brand id
  const brandId = req.query.brand || 'All';

  // get filter
  const filter = getFilter(searchText, brandId, category);

  // get product in category count
  const count = await productModel.count(filter);

  // get last page index
  const lastPage = count != 0 ? Math.ceil(count / PRODUCT_PER_PAGE) : 1;

  // get page
  let page = req.query.page || 1;
  page = page < 0 ? 1 : page;
  page = page > lastPage ? lastPage : page;

  const productPromise = productModel.list(filter, page - 1, PRODUCT_PER_PAGE);

  const listBrand = await brandPromise;
  const listProduct = await productPromise;

  listProduct.map(product => {
      product.brand = listBrand.find(brand => brand._id.equals(product.brand)).name;
      product.category = category.name
      return product; 
  });

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

const getFilter = (searchText, brandId, category) => {

  const filter = { $and: [ {category: ObjectId(category._id)} ] };

  // if searchText != null
  if(searchText != null) {
    filter.$and.push({
      $or: [
        { $text: { $search: searchText } },
        { name: { $regex: searchText, $options: 'i' } }
      ]
    })
  }

  // if id != 'All'
  if (ObjectId.isValid(brandId)) {
    filter.$and.push({ brand: ObjectId(brandId) });
  }

  return filter;
}