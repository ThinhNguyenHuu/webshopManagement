const brandModel = require('./brandModel');
const categoryModel = require('./categoryModel');
const { ObjectId } = require('mongodb');
const {db} = require('../db');
const cache = require('../lru-cache');

module.exports.list = async (filter, pageIndex, itemPerPage) => {

  const key = ['listOrder', pageIndex, itemPerPage].join('/');

  // get cached data
  const value = await cache.get(key);
  if (value) return value;

  // get count
  const count = await this.count();

  // get last page
  let lastPage = Math.ceil(count / itemPerPage);
  lastPage = lastPage < 1 ? 1 : lastPage;

  // get current page
  let page = parseInt(pageIndex) || 1;
  page = page < 0 ? 1 : page;
  page = page > lastPage ? lastPage : page;

  const listOrder = await db().collection('order').aggregate([
    {
      $skip: itemPerPage * (page - 1)
    },
    {
      $limit: itemPerPage
    },
    {
      $sort: { _id: -1 }
    },
    {
      $lookup: {
        from: 'user',
        localField: 'user',
        foreignField: '_id',
        as: 'order_user'
      }
    }
  ]).toArray();

  listOrder.map(async (order) => {
    order.user = order.order_user[0];
    order.date = (new Date(order.date)).toLocaleDateString('en-US');
    return order;
  });

  const data = {
    listOrder,
    page,
    lastPage
  };

  // cache data
  await cache.set(key, value);

  return data;
}

module.exports.getOrderProduct = async (orderId, pageIndex, itemPerPage) => {

  const key = ['orderProduct', orderId, pageIndex || 1, itemPerPage].join('/');

  // get cached data
  const value = await cache.get(key);
  if (value) return value;

  // get count
  const count = await this.countOrderProduct(orderId);

  // get last page
  let lastPage = Math.ceil(count / itemPerPage);
  lastPage = lastPage < 1 ? 1 : lastPage;

  // get current page
  let page = parseInt(pageIndex) || 1;
  page = page < 0 ? 1 : page;
  page = page > lastPage ? lastPage : page;

  const orderProduct = await db().collection('order_product').aggregate([
    {
      $match: { order: ObjectId(orderId) }
    },
    {
      $skip: itemPerPage * (page - 1)
    },
    {
      $limit: itemPerPage
    },
    {
      $lookup: {
        from: 'product',
        localField: 'product',
        foreignField: '_id',
        as: 'object_product'
      }
    }
  ]).toArray();

  orderProduct.map(product => {
    product.name = product.object_product[0].name;
  });

  const data = {
    orderProduct,
    page,
    lastPage
  }

  // cache data
  await cache.set(key, value);

  return data;
}

module.exports.salesByTime = async (from, to) => {

  const listOrder = await db().collection('order').find({
    date: {
      $gte: new Date(from),
      $lt: new Date(to)
    }
  })
  .toArray();

  const listOrderId = listOrder.map(order => order._id);

  const salesPromise = db().collection('order_product').aggregate([
    {
      $match: { 'order': { $in: listOrderId } }
    },
    {
      $group: {
        _id: { product_id: '$product', price: '$price' },
        total_quantity_all: { $sum: '$quantity' },
        total_price_all: { $sum: '$total_price' }
      }
    },
    {
      $lookup: {
        from: 'product',
        localField: '_id.product_id',
        foreignField: '_id',
        as: 'product'
      }
    }
  ]).toArray();

  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    salesPromise
  ]);

  const listBrand = result[0];
  const listCategory = result[1];
  const sales = result[2];

  sales.map(item => {
    item.name = item.product[0].name;
    item.price = item._id.price
    item.brand = listBrand.find(brand => brand._id.equals(item.product[0].brand)).name;
    item.category = listCategory.find(category => category._id.equals(item.product[0].category)).name;
    return item;
  });

  let totalPrice = 0;
  sales.forEach(item => {
    totalPrice += item.total_price_all;
  });

  return { sales, totalPrice };
}

module.exports.count = async () => {
  return await db().collection('order').countDocuments({});
}

module.exports.countOrderProduct = async (orderId) => {
  return await db().collection('order').countDocuments({order: ObjectId(orderId)});
}

module.exports.findOne = async (id) => {
  let order = await db().collection('order').aggregate([
    {
      $match: { _id: ObjectId(id) }
    },
    {
      $lookup: {
        from: 'user',
        localField: 'user',
        foreignField: '_id',
        as: 'order_user'
      } 
    }
  ]).toArray();

  order = order[0];
  order.user = order.order_user[0];
  order.date = (new Date(order.date)).toLocaleDateString('en-US');
  return order;
}

module.exports.updateStatus = async (type, id) => {
  const statusList = ['Chờ lấy hàng', 'Đang giao hàng', 'Đã nhận hàng'];
  const status = statusList[type - 1];

  await db().collection('order').updateOne({_id: ObjectId(id)}, {
    $set: { status: status }
  });
}