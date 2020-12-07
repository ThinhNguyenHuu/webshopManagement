const {db} = require('../db');

module.exports.list = async () => await db().collection('brand').find().sort({_id: -1}).toArray();