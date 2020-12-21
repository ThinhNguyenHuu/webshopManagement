const { ObjectId } = require('mongodb');
const {db} = require('../db');

module.exports.list = async (pageIndex, itemPerPage) => {
  return await db().collection('user').find({}, {
    skip: itemPerPage * pageIndex,
    limit: itemPerPage
  }).sort({_id: -1}).toArray();
}

module.exports.findOne = async (filter) => await db().collection('user').findOne(filter);

module.exports.ban = async (id) => {
  await db().collection('user').updateOne({_id: ObjectId(id)}, {$set: {
    ban: true
  }});
}

module.exports.unban = async (id) => {
  await db().collection('user').updateOne({_id: ObjectId(id)}, {$set: {
    ban: false
  }});
}

module.exports.count = async () => await db().collection('user').countDocuments({});