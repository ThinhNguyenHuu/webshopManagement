const brandModel = require('./brandModel');
const categoryModel = require('./categoryModel');
const { ObjectId } = require('mongodb');
const {db} = require('../db');

module.exports.list = async (pageIndex, itemPerPage) => {

  // get count
  const count = await this.count();

  // get last page
  let lastPage = Math.ceil(count / itemPerPage);
  lastPage = lastPage < 1 ? 1 : lastPage;

  // get current page
  let page = parseInt(pageIndex) || 1;
  page = page < 0 ? 1 : page;
  page = page > lastPage ? lastPage : page;

  const result = await Promise.all([
    brandModel.list(),
    categoryModel.list(),
    db().collection('user').find({}, {
      skip: itemPerPage * (page - 1),
      limit: itemPerPage
    }).sort({_id: -1}).toArray()
  ]);

  return {
    listBrand: result[0],
    listCategory: result[1],
    listUser: result[2],
    page,
    lastPage
  };
}

module.exports.findOne = async (id) => await db().collection('user').findOne({_id: ObjectId(id)});

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
  const user = await this.findOne(id);

  let source = null;
  if(file) {
    const destroyPromise = cloudinary.destroyFiles(user.avatar);
        const new_sources = await cloudinary.uploadFiles(file);
        await destroyPromise;
        source = new_sources[0];
  }

  await db().collection('user').updateOne({_id: ObjectId(id)}, {$set: {
    fullname: data.fullname,
    password: data.newPassword,
    avatar: source ? user.avatar : source
  }});
}

module.exports.findByEmail = async (email) => await db().collection('user').findOne({email: email});

module.exports.count = async () => await db().collection('user').countDocuments({});