const brandModel = require('./brandModel');
const categoryModel = require('./categoryModel');
const { ObjectId } = require('mongodb');
const {db} = require('../db');
const cloudinary = require('../cloudinary');
const bcrypt = require('bcrypt');
const cache = require('../lru-cache');

module.exports.list = async (pageIndex, itemPerPage) => {

  const key = ['listUser', pageIndex || 1, itemPerPage].join('/');

  // get cached data
  const value = await cache.get(key);
  if (value) return value;

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

  const data = {
    listBrand: result[0],
    listCategory: result[1],
    listUser: result[2],
    page,
    lastPage
  };

  // cache data
  await cache.set(key, data);

  return data;
}

module.exports.findOne = async (id) => await db().collection('user').findOne({_id: ObjectId(id)});

module.exports.ban = async (id) => {
  await Promise.all([
    db().collection('user').updateOne({_id: ObjectId(id)}, {$set: {
      ban: true
    }})
    ,
    cache.clear()
  ]);
}

module.exports.unban = async (id) => {
  await Promise.all([
    db().collection('user').updateOne({_id: ObjectId(id)}, {$set: {
      ban: false
    }})
    ,
    cache.clear()
  ]);
}

module.exports.update = async (data, file, id) => {
  const user = await this.findOne(id);

  // upload image
  let source = null;
  if(file) {
    const destroyPromise = cloudinary.destroyFiles(user.avatar);
    const new_sources = await cloudinary.uploadFiles(file);
    await destroyPromise;
    source = new_sources[0];
  }

  const saltRounds = 10;
  if(data.newPassword) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(data.newPassword, salt);
    data.password = hash;
  } else {
    data.password = user.password;
  }

  // update db
  await Promise.all([
    db().collection('user').updateOne({_id: ObjectId(id)}, {$set: {
      fullname: data.fullname,
      password: data.password,
      avatar: source ? source : user.avatar
    }})
    ,
    cache.clear()
  ]);
}

module.exports.findByUsername = async (username) => await db().collection('user').findOne({username: username});

module.exports.checkCredential = async (password, username) => {
  const user = await this.findByUsername(username);
  if (!user)
    return {
      error: 'Người dùng không tồn tại.',
      result: false
    }
  
  if (!await bcrypt.compare(password, user.password))
    return {
      error: 'Sai mật khẩu.',
      result: false
    }

  return {
    error: '',
    result: user
  }
}

module.exports.checkCredentialWithId = async (password, id) => {
  const user = await this.findOne(id);
  if (!user)
    return {
      error: 'Người dùng không tồn tại.',
      result: false
    }
  
  if (!await bcrypt.compare(password, user.password))
    return {
      error: 'Sai mật khẩu.',
      result: false
    }

  return {
    error: '',
    result: user
  }
}

module.exports.count = async () => await db().collection('user').countDocuments({});