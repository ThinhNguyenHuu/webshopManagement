const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');

module.exports.sales = async (req, res, next) => {

  if (!req.query.from) {
    const date = new Date(); date.setHours(0, 0, 0, 0);
    const start = new Date(date);
    const end = new Date(date); end.setDate(date.getDate() + 1);
    
    req.query.from = [("0" + (start.getMonth() + 1)).slice(-2), ("0" + start.getDate()).slice(-2), start.getFullYear()].join('/');
    req.query.to = [("0" + (end.getMonth() + 1)).slice(-2), ("0" + end.getDate()).slice(-2), end.getFullYear()].join('/');
  }

  const { sales, totalPrice } = await orderModel.salesByTime(req.query.from, req.query.to);
  res.render('statistic/sales', { 
    sales, totalPrice, 
    from: req.query.from, 
    to: req.query.to, 
    title: 'Doanh số bán hàng',
    isStatisticPage: true
  });
}

module.exports.topTenSeller = async (req, res, next) => {
  const listProduct = await productModel.listTopTenSeller(req.query.category, req.query.brand);
  res.render('statistic/topTenSeller', {
    listProduct: listProduct,
    brandId: req.query.brand,
    categoryId: req.query.category,
    title: 'Số lượng bán top 10',
    isStatisticPage: true
  })
}