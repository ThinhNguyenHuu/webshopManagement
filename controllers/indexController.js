const categoryModel = require('../models/categoryModel');
const brandModel = require('../models/brandModel');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const analytics = require('../analytics');

module.exports.index = async (req, res, next) => {
  const result = await Promise.all([
    categoryModel.list(), 
    brandModel.list(),
    productModel.count({}),
    orderModel.count(),
    userModel.count(),
    analytics.getOnlineUser(),
    analytics.getUserAccessData(),
    analytics.getTopSearchQueryData(),
    analytics.getUserLocationData()
  ]);
  res.render('index', { 
    listCategory: result[0],
    listBrand: result[1],
    totalProduct: result[2],
    totalOrder: result[3],
    totalUser: result[4],
    onlineUser: result[5],
    userAccess: encodeURIComponent(JSON.stringify(result[6])),
    topSearchQuery: encodeURIComponent(JSON.stringify(result[7])),
    userLocation: encodeURIComponent(JSON.stringify(result[8]))
  });
}