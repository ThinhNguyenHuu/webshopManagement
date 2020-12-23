const { check, validationResult } = require('express-validator');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
  
module.exports.productValidator = [
  check('name')
    .trim()
    .isLength({min: 10, max: 50}).withMessage('Tên nằm trong khoảng 10 đến 50 ký tự.')
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
];

module.exports.userValidator = [
  check('name')
    .trim()
    .isLength({min: 5, max: 30}).withMessage('Tên nằm trong khoảng 5 đến 30 ký tự.')
    ,
  check('password')
    .trim()
    .isLength({min: 6}).withMessage('Mật khẩu có ít nhất 6 ký tự.') 
    .custom(async (password, {req}) => {
      const checkCredential = await userModel.checkCredential(password, req.params._id);
      if(!checkCredential)
        throw new Error('Sai mật khẩu.');
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
    })
]