const orderModel = require('../models/orderModel');

const ORDER_PER_PAGE = 8;

module.exports.index = async (req, res, next) => {

  const { 
    listOrder, 
    page, 
    lastPage 
  } = await orderModel.list({}, req.query.page, ORDER_PER_PAGE);

  listOrder.map(order => {
    let color = 'red'
    if (order.status === 'Đang giao hàng')  color = 'orange'
    if (order.status === 'Đã nhận hàng') color = 'green';
    order.statusColor = color;
  })

  res.render('order/list', {
    title: 'Đơn đặt hàng',
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
    orderModel.findOne(req.params._id),
    orderModel.getOrderProduct(req.params._id, req.query.page, PRODUCT_PER_PAGE)
  ]);

  console.log(result);

  if (!result[0] || !result[1])
    return next();

  const order = result[0];
  const { orderProduct, page, lastPage } = result[1];
  
  const orderStatus = {
    waitingForProduct: order.status === 'Chờ lấy hàng',
    deliveringProduct: order.status === 'Đang giao hàng',
    receivedProduct: order.status === 'Đã nhận hàng'
  }

  res.render('order/details', {
    title: 'Chi tiết đơn đặt hàng',
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
