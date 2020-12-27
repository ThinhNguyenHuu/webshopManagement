const { ObjectId } = require('mongodb');
const {db} = require('../db');

module.exports.list = async () => await db().collection('brand').find().toArray();

module.exports.findOne = async (id) => await db().collection('brand').findOne({_id: ObjectId(id)});