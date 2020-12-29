const { ObjectId } = require('mongodb');
const {db} = require('../db');
const cache = require('../lru-cache');

module.exports.list = async () => {

  const value = await cache.get('listCategory');
  if (value) {
    return value
  } else {
    const listCategory = await db().collection('category').find().toArray();
    await cache.set('listCategory', listCategory);
    return listCategory;
  }
}

module.exports.findOne = async (id) => await db().collection('category').findOne({_id: ObjectId(id)});