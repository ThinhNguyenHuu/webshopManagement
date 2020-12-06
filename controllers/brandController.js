const productModel = require('../models/productModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const { ObjectId } = require('mongodb');
const db = require('../db');

const PRODUCT_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  const categoryPromise = categoryModel.list();
  const brandPromise = brandModel.list();

  const listBrand = await brandPromise;
  const brand = listBrand.find(brand => brand._id.equals(ObjectId(req.params._id)));

  // get search text
  const searchText = req.query.name || null;
  const filter = searchText == null ? 
    { brand: ObjectId(brand._id) } : 
    {
      $and: [
        { brand: ObjectId(brand._id) },
        { $or: [
          { $text: { $search: searchText } },
          { name: { $regex: searchText, $options: 'i' } }
        ]}
      ]
    };

  // get product in category count
  const count = await productModel.count(filter);

  // get last page index
  const lastPage = Math.ceil(count / PRODUCT_PER_PAGE);

  // get page
  let page = req.query.page || 1;
  page = page < 0 ? 1 : page;
  page = page > lastPage ? lastPage : page;

  const productPromise = productModel.list(filter, page - 1, PRODUCT_PER_PAGE);

  const listCategory = await categoryPromise;
  const listProduct = await productPromise;

  listProduct.map(product => {
      product.brand = brand.name;
      product.category = listCategory.find(category => category._id.equals(product.category)).name;
      return product; 
  });

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