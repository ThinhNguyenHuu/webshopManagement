const { ObjectId } = require('mongodb');
const {db} = require('../db');

module.exports.list = async () => await db().collection('category').find().toArray();

module.exports.findOne = async (id) => await db().collection('category').findOne({_id: ObjectId(id)});