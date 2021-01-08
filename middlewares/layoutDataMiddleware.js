const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');

module.exports.getSidebarData = async (req, res, next) => {
  const result = await Promise.all([ brandModel.list(), categoryModel.list() ]);
  res.locals.listBrand = result[0];
  res.locals.listCategory = result[1];
  next();
}