const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const { productValidator } = require('../middlewares/validationMiddleware');

router.get('/', controller.index);

router.get('/delete/:_id', controller.get_delete);

router.get('/add', controller.get_add);

router.post('/add', productValidator, controller.post_add);

router.get('/edit/:_id', controller.get_edit);

router.post('/edit/:_id', productValidator , controller.post_edit);

module.exports = router;
