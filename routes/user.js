const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { userValidator } = require('../middlewares/validationMiddleware');

router.get('/', controller.index);

router.get('/:_id', controller.details);

router.get('/ban/:_id', controller.ban);

router.get('/unban/:_id', controller.unban);

router.get('/edit/:_id', controller.get_edit);

router.post('/edit/:_id', userValidator, controller.post_edit);

module.exports = router;
