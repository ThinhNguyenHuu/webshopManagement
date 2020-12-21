const {db} = require('../db');

module.exports.list = async (filter, pageIndex, itemPerPage) => {
  return await db().collection('order').find(filter, {
    skip: itemPerPage * pageIndex,
    limit: itemPerPage
  }).sort({_id: -1}).toArray();
}

module.exports.count = async () => {
  return await db().collection('order').countDocuments({});
}

module.exports.findOne = async (filter) => {
  return await db().collection('order').findOne(filter);
}