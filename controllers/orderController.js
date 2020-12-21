const productModel = require('../models/productModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const { ObjectId } = require('mongodb');


const ORDER_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  // get count
  const count = await orderModel.count();

  // get last page
  const lastPage = Math.ceil(count / ORDER_PER_PAGE);

  // get current page
  let page = parseInt(req.query.page) || 1;
  page = page < 0 ? 1 : page;
  page = page > lastPage ? lastPage : page;

  // get data
  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    userModel.list(),
    productModel.list(),
    orderModel.list(page - 1, ORDER_PER_PAGE)
  ]);

  const listBrand = result[0];
  const listCategory = result[1];
  const listUser = result[2];
  const listProduct = result[3];
  const listOrder = result[4];

  listOrder.map(order => {
    order.user = listUser.find(user => user._id.equals(order.user));
    order.ordered_products.map(ordered_product => {
      ordered_product.product = listProduct.find(product => product._id.equals(ordered_products.product));
      return ordered_product;
    });
    order.total_price = order.ordered_products.reduce((a, b) => {
      return { price: (a.price - a.price * a.discount) * a.quantity + 
                      (b.price - b.price * b.discount) * b.quantity};
    }).price;

    return order;
  });

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
  
  const result = Promise.all([
    brandModel.list(),
    categoryModel.list(),
    orderModel.findOne({_id: ObjectId(req.params._id)})
  ]);

  const order = result[2];

  order.user = await userModel.findOne({_id: ObjectId(order.user)});
  order.ordered_products.map(async (ordered_product) => {
    ordered_product.product = await productModel.findOne({_id: ObjectId(ordered_product.product)});
    const price = ordered_product.product.price;
    ordered_product.final_price = (price - price * ordered_product.discount) * ordered_product.quantity;
    return ordered_product;
  });
  order.total_price = order.ordered_products.reduce((a, b) => {
    return { price: (a.price - a.price * a.discount) * a.quantity + 
                    (b.price - b.price * b.discount) * b.quantity}; 
  }).price;

  res.render('order/details', {
    title: 'Chi tiết đơn đặt hàng',
    listBrand,
    listCategory,
    order,
    pageLink: '/order'
  })
}
