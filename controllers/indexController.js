const categoryModel = require('../models/categoryModel');
const brandModel = require('../models/brandModel');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');

module.exports.index = async (req, res, next) => {
  const result = await Promise.all([
    categoryModel.list(), 
    brandModel.list(),
    productModel.count({}),
    orderModel.count(),
    userModel.count()
  ]);
  res.render('index', { 
    listCategory: result[0],
    listBrand: result[1],
    totalProduct: result[2],
    totalOrder: result[3],
    totalUser: result[4],
    isDashboard: true
  });
}