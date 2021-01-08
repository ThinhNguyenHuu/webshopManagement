const { check } = require('express-validator');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const brandModel = require('../models/brandModel');
const categoryModel = require('../models/categoryModel');
  
module.exports.productValidator = [
  check('name')
    .trim()
    .isLength({min: 10}).withMessage('Tên tối thiểu 10 ký tự.')
    .isLength({max: 50}).withMessage('Tền tối đa 50 ký tự.')
    .custom(async (name, {req}) => {
      const duplicatedProduct = await productModel.checkDuplicated(req.params._id, name);
      if(duplicatedProduct)
        throw new Error('Tên sản phẩm bị trùng.');
      return true;
    })
    ,
  check('description')
    .trim()
    .isLength({min: 20}).withMessage('Mô tả phải có ít nhất 20 ký tự')
    ,
  check('price')
    .isFloat({min: 100000, max: 100000000}).withMessage('Giá nằm trong khoảng từ 100.000đ đến 100.000.000đ')
    ,
  check('discount')
    .isFloat({min: 0, max: 100}).withMessage('Khuyển mãi nằm trong khoảng từ 0% đến 100%')
    ,
  check('brand')
    .custom(async (brandId, {req}) => {
      const result = await Promise.all([
        brandModel.findOne(brandId),
        categoryModel.findOne(req.body.category)
      ]);

      const brand = result[0];
      const category = result[1];

      if(!brand.category.find(item => item.equals(category._id)))
        throw new Error('Trong ' + category.name + ' không có thương hiệu ' + brand.name + '.');
      return true;
    })
];

module.exports.userValidator = [
  check('fullname')
    .trim()
    .isLength({min: 5}).withMessage('Tên tối thiểu 5 ký tự.')
    .isLength({max: 30}).withMessage('Tên tối đa 30 ký tự')
    ,
  check('password')
    .trim()
    .isLength({min: 6}).withMessage('Mật khẩu có ít nhất 6 ký tự.') 
    .custom(async (password, {req, res}) => {
      const { error } = await userModel.checkCredentialWithId(password, req.params._id);
      if(error)
        throw new Error('Sai mật khẩu');
      return true;
    })
    ,
  check('newPassword')
    .trim()
    .custom(newPassword => {
      if (newPassword && newPassword.length < 6)
        throw new Error('Mật khẩu có ít nhất 6 ký tự');
      return true;
    })
    ,
  check('newPasswordAgain')
    .trim()
    .custom((newPasswordAgain, {req}) => {
      if (newPasswordAgain != req.body.newPassword)
        throw new Error('Nhập lại mật khẩu không khớp mật khẩu mới');
      return true;
    })
]

module.exports.emailValidator = [
  check('email')
    .trim()
    .isEmail().withMessage('Email không hợp lệ.')
    .custom(async (email) => {
      const find = userModel.findByEmail(email);
      if (!find)
        throw new Error('Không có tài khoản sử dụng email này.');
      return true;
    })
]

module.exports.updatePasswordValidator = [
  check('password')
    .trim()
    .isLength({min: 6}).withMessage('Mật khẩu có ít nhất 6 ký tự.')
    ,
  check('confirmPassword')
    .trim()
    .custom((confirmPassword, {req}) => {
      if (confirmPassword != req.body.password)
        throw new Error('Nhập lại mật khẩu không trùng khớp.');
      return true;
    })
]