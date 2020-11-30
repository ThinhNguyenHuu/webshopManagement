const request = require('request');
const model = require('../models/productModel');
const url = require('url');

module.exports.index = async (req, res, next) => {

  //request('https://inspiredigital.herokuapp.com/api/product', (error, response, body) => {
    //if (!error && response.statusCode == 200) {
      //const list = JSON.parse(body);
    const list = await model.list();
    res.render('index', { list });
  //}
  //});
}

module.exports.get_delete = async (req, res, next) => {
  res.render('delete', {
    _id: req.params._id
  })
}

module.exports.post_delete = async (req, res, next) => {
    //request('https://inspiredigital.herokuapp.com/api/product/delete/' + req.params._id, (error, response, body) => {
    //res.redirect('/');
  //})
  await model.delete(req.params._id);
  res.redirect ("/");

}

module.exports.get_add = (req, res, next) => {
  res.render('add');
}

module.exports.post_add = async (req, res, next) => {
  //res.send(req.body);
  await model.add(req.body);

  res.redirect ("/");
}

module.exports.get_edit = async (req, res, next) => {
  res.render('edit', {_id: req.params._id});
}

module.exports.post_edit = async (req, res, next) => {
  await model.update(req.body, req.params._id);

  res.redirect("/");
}