const categoryModel = require('../models/categoryModel');
const brandModel = require('../models/brandModel');

module.exports.index = async (req, res, next) => {
  const result = Promise.all([categoryModel.list(), brandModel.list()]);
  res.render('index', { 
    listCategory: result[0],
    listBrand: result[1]
  });
}