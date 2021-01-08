const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');

module.exports.index = async (req, res, next) => {
  const result = await Promise.all([
    productModel.count({}),
    orderModel.count(),
    userModel.count()
  ]);
  res.render('index', { 
    totalProduct: result[0],
    totalOrder: result[1],
    totalUser: result[2],
    isDashboard: true
  });
}