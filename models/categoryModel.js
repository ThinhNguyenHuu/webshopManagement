const {db} = require('../db');

module.exports.list = async () => await db().collection('category').find().sort({_id: -1}).toArray();
