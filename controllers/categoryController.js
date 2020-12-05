const productModel = require('../models/productModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const { ObjectId } = require('mongodb');
const db = require('../db');

const PRODUCT_PER_PAGE = 5;

module.exports.index = async (req, res, next) => {

  const categoryPromise = categoryModel.list();
  const brandPromise = brandModel.list();

  const listCategory = await categoryPromise;
  const category = listCategory.find(category => category._id.equals(ObjectId(req.params._id)));

  // get product in category count
  const count = await productModel.countInCategory(category._id);

  // get last page index
  const lastPage = Math.ceil(count / PRODUCT_PER_PAGE);

  // get search text
  const searchText = req.query.name || null;
  const filter = searchText == null ? 
    { category: ObjectId(category._id) } : 
    {
      $and: [
        { category: ObjectId(category._id) },
        { $or: [
          { $text: { $search: searchText } },
          { name: { $regex: searchText, $options: 'i' } }
        ]}
      ]
    };

  // get page
  let page = req.query.page || 1;
  page = page < 0 ? 1 : page;
  page = page > lastPage ? lastPage : page;

  const productPromise = productModel.list(filter, 
                                            searchText == null ? page - 1 : 0,
                                            searchText == null ? PRODUCT_PER_PAGE : 0);

  const listBrand = await brandPromise;
  const listProduct = await productPromise;

  listProduct.map(product => {
      product.brand = listBrand.find(brand => brand._id.equals(product.brand)).name;
      product.category = category.name
      return product; 
  });

  res.render('product/index', { 
    title: category.name,
    listProduct,
    listCategory,
    listBrand,
    pageLink: '/category/' + category._id,
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1 && searchText == null,
    haveNextPage: page < lastPage && searchText == null
  });
}