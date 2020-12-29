const { ObjectId } = require('mongodb');
const {db} = require('../db');
const cache = require('../lru-cache');

module.exports.list = async () => {

  const value = await cache.get('listBrand');
  if (value) {
    return value;
  } else {
    const listBrand = await db().collection('brand').find().toArray();
    await cache.set('listBrand', listBrand);
    return listBrand;
  }
}

module.exports.findOne = async (id) => await db().collection('brand').findOne({_id: ObjectId(id)});