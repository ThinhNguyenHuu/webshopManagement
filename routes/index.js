const express = require('express');
const router = express.Router();
const controller = require('../controllers/indexController');


router.get('/', controller.index);

router.get('/delete/:_id', controller.get_delete);

router.post('/delete/:_id', controller.post_delete);

router.get('/add', controller.get_add);

router.post('/add', controller.post_add);

router.get('/edit/:_id', controller.get_edit);

router.post('/edit/:_id', controller.post_edit);

module.exports = router;
