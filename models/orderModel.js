const brandModel = require('./brandModel');
const categoryModel = require('./categoryModel');
const { ObjectId } = require('mongodb');
const {db} = require('../db');

module.exports.list = async (filter, pageIndex, itemPerPage) => {

  // get count
  const count = await orderModel.count();

  // get last page
  let lastPage = Math.ceil(count / ORDER_PER_PAGE);
  lastPage = lastPage < 1 ? 1 : lastPage;

  // get current page
  let page = parseInt(pageIndex) || 1;
  page = page < 0 ? 1 : page;
  page = page > lastPage ? lastPage : page;

  // get data
  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    userModel.list(),
    productModel.list(),
    db().collection('order').find({}, {
      skip: itemPerPage * (page - 1),
      limit: itemPerPage
    }).sort({_id: -1}).toArray()
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

  return{
    listBrand,
    listCategory,
    listOrder,
    page,
    lastPage
  };
}

module.exports.details = async (id) => {

  const order = await orderModel.findOne(id);

  order.user = await userModel.findOne(order.user);
  order.ordered_products.map(async (ordered_product) => {
    ordered_product.product = await productModel.findOne(ordered_product.product);
    ordered_product.final_price = 
      (ordered_product.price - ordered_product.price * ordered_product.discount) * ordered_product.quantity;
      
    return ordered_product;
  });
  order.total_price = order.ordered_products.reduce((a, b) => {
    return { price: (a.price - a.price * a.discount) * a.quantity + 
                    (b.price - b.price * b.discount) * b.quantity}; 
  }).price;

  return order;
}

module.exports.count = async () => {
  return await db().collection('order').countDocuments({});
}

module.exports.findOne = async (id) => {
  return await db().collection('order').findOne({_id: ObjectId(id)});
}