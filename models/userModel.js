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

  const listUser = await db().collection('user').find({}, {
    skip: itemPerPage * (page - 1),
    limit: itemPerPage
  }).sort({_id: -1}).toArray();

  const data = { listUser, page, lastPage };

  // cache data
  await cache.set(key, data);

  return data;
}

module.exports.findOne = async (id) => {
  if (!ObjectId.isValid(id))
    return false;
  return await db().collection('user').findOne({_id: ObjectId(id)});
}

module.exports.ban = async (id) => {
  if (!ObjectId.isValid(id))
    return false;

  await Promise.all([
    db().collection('user').updateOne({_id: ObjectId(id)}, {$set: {
      ban: true
    }})
    ,
    cache.clear()
  ]);

  return true;
}

module.exports.unban = async (id) => {
  if (!ObjectId.isValid(id))
    return false;

  await Promise.all([
    db().collection('user').updateOne({_id: ObjectId(id)}, {$set: {
      ban: false
    }})
    ,
    cache.clear()
  ]);

  return true;
}

module.exports.add = async (data) => {
  const verifyHash = await hash(Math.floor(Math.random() * 101).toString());
  data.password = await hash(data.password);

  const result = await Promise.all([
    db().collection('user').insertOne({
      fullname: data.fullname,
      username: data.username,
      email: data.email,
      password: data.password,
      verification: verifyHash,
      ban: false,
      avatar: null,
      active: true,
      is_admin: true
    })
    ,
    cache.clear()
  ]);

  return result[0].insertedId
}

module.exports.update = async (data, file, id) => {
  const user = await this.findOne(id);
  if (!user)
    return false;

  // upload image
  let source = null;
  if(file) {
    const destroyPromise = cloudinary.destroyFiles(user.avatar);
    const new_sources = await cloudinary.uploadFiles(file);
    await destroyPromise;
    source = new_sources[0];
  }

  if(data.newPassword) 
    data.password = await hash(data.newPassword);
  else data.password = user.password;

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

  return true;
}

module.exports.findByUsername = async (username) => {
  return await db().collection('user').findOne({username: username});
}

module.exports.findByEmail = async (email) => {
  return await db().collection('user').findOne({email: email});
}

module.exports.checkCredential = async (password, username) => {
  const user = await this.findByUsername(username);

  if (!user || !user.is_admin)
    return { error: 'Người dùng không tồn tại.' }

  if (user.ban)
    return { error: 'Người dùng đã bị khóa.' }
  
  if (!await bcrypt.compare(password, user.password))
    return { error: 'Sai mật khẩu.' }

  return { result: user }
}

module.exports.checkCredentialWithId = async (password, id) => {
  const user = await this.findOne(id);
  if (!user || !user.is_admin)
    return { error: 'Người dùng không tồn tại.' }
  
  if (user.ban)
    return { error: 'Người dùng đã bị khóa.' }

  if (!await bcrypt.compare(password, user.password))
    return { error: 'Sai mật khẩu.' }

  return { result: user }
}

module.exports.checkVerificationCode = async (code, id) => {
  const find = await this.findOne(id);
  if (!find) 
    return false;
  return find.verification === code;
}

module.exports.updatePassword = async (password, id) => {
  const hashPass = await hash(password);
  await db().collection('user').updateOne({_id: ObjectId(id)}, {
    $set: {
      password: hashPass
    }
  });
}

module.exports.count = async () => {
  return await db().collection('user').countDocuments({});
}

const hash = async (data) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(data, salt);
  return hash;
}