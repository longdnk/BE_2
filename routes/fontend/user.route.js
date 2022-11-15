var express = require('express');
var router = express.Router();

router.use(express.static(__dirname + './public'));

var controller = require('../../controllers/fontend/user.controller');
const auth = require('../../middlewares/auth')


//router.post('/create', controller.postAdd);
router.post('/login', controller.postLogin);

//====> Duplicate Route to Update API
router.post('/login-update', controller.postLoginNew);
//====> Duplicate Route to Update API

router.get('/me', auth, controller.getMe);
router.get('/me/logout', auth, controller.getLogout);

router.get('/edit', controller.getEdit);
router.post('/edit', controller.postEdit);

module.exports = router;
