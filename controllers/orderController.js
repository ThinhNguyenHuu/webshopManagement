const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const orderModel = require('../models/orderModel');
const { ObjectId } = require('mongodb');


const ORDER_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  const {
    listBrand,
    listCategory,
    listOrder,
    page,
    lastPage
  } = await orderModel.list(null, req.query,page, ORDER_PER_PAGE);

  res.render('order/index', {
    title: 'Đơn đặt hàng',
    listBrand,
    listCategory,
    listOrder,
    pageLink: '/order',
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1,
    haveLastPage: page < lastPage
  });
}

module.exports.details = async (req, res, next) => {
  
  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    orderModel.details(req.params._id)
  ]);

  res.render('order/details', {
    title: 'Chi tiết đơn đặt hàng',
    listBrand: result[0],
    listCategory: result[1],
    order: result[2],
    pageLink: '/order'
  })
}
