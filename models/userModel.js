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

module.exports.update = async (data, file, id) => {
  const user = await this.findOne({_id: ObjectId(id)});

  let source = null;
  if(file) {
    const destroyPromise = cloudinary.destroyFiles(product.images_sources);
        const new_sources = await cloudinary.uploadFiles(files);
        await destroyPromise;
        source = [...new_sources];
  }

  await db().collection('user').updateOne({_id: ObjectId(id)}, {$set: {
    fullname: data.fullname,
    password: data.newPassword,
    avatar: source ? user.avatar : source
  }});
}

module.exports.count = async () => await db().collection('user').countDocuments({});