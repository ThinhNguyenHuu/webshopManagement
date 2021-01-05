const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
const orderModel = require('../models/orderModel');


const ORDER_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    orderModel.list({}, req.query.page, ORDER_PER_PAGE)
  ]);

  const { listOrder, page, lastPage } = result[2];
  listOrder.map(order => {
    let color = 'red'
    if (order.status === 'Đang giao hàng')  color = 'orange'
    if (order.status === 'Đã nhận hàng') color = 'green';
    order.statusColor = color;
  })

  res.render('order/index', {
    title: 'Đơn đặt hàng',
    listBrand: result[0],
    listCategory: result[1],
    listOrder,
    pageLink: '/order',
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1,
    haveLastPage: page < lastPage,
    isOrderPage: true
  });
}

const PRODUCT_PER_PAGE = 8;

module.exports.details = async (req, res, next) => {
  
  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    orderModel.findOne(req.params._id),
    orderModel.getOrderProduct(req.params._id, req.query.page, PRODUCT_PER_PAGE)
  ]);

  const order = result[2];
  const { orderProduct, page, lastPage } = result[3];
  const orderStatus = {
    waitingForProduct: order.status === 'Chờ lấy hàng',
    deliveringProduct: order.status === 'Đang giao hàng',
    receivedProduct: order.status === 'Đã nhận hàng'
  }

  res.render('order/details', {
    title: 'Chi tiết đơn đặt hàng',
    listBrand: result[0],
    listCategory: result[1],
    order,
    orderProduct,
    page,
    lastPage,
    previousPage: page - 1,
    nextPage: page + 1,
    havePreviousPage: page > 1,
    haveNextPage: page < lastPage,
    orderStatus,
    isOrderPage: true
  })
}

module.exports.updateStatus = async (req, res, next) => {
  await orderModel.updateStatus(req.params.type, req.params._id);
  res.redirect(req.get('referer'));
}
