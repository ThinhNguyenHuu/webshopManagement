const productModel = require('../models/productModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const orderModel = require('../models/orderModel');

module.exports.sales = async (req, res, next) => {

  if (!req.query.from) {
    const date = new Date(); date.setHours(0, 0, 0, 0);
    const start = new Date(date);
    const end = new Date(date); end.setDate(date.getDate() + 1);
    
    req.query.from = start.toLocaleDateString('en-US');
    req.query.to = end.toLocaleDateString('en-US');
  }

  const { sales, totalPrice } = await orderModel.salesByTime(req.query.from, req.query.to);
  res.render('statistic/sales', { 
    sales, totalPrice, 
    from: req.query.from, 
    to: req.query.to, 
    title: 'Doanh số bán hàng'
  });
}

module.exports.topTenSeller = async (req, res, next) => {
  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    productModel.listTopTenSeller(req.query.category, req.query.brand)
  ]);

  res.render('statistic/topTenSeller', {
    listBrand: result[0],
    listCategory: result[1],
    listProduct: result[2],
    brandId: req.query.brand,
    categoryId: req.query.category,
    title: 'Số lượng bán top 10'
  })
}