var express = require('express');
var router = express.Router();

// router.use(express.static(__dirname + './public'));

var controller = require('../controllers/station.controller');
var validate = require('../validate/station.validate');
var middleware = require('../middlewares/auth.middleware');

// router.get('/', middleware.requireAuth, controller.list);
// router.get('/add', controller.getAdd);
// router.post('/add', validate.postAdd, controller.postAdd);

// router.get('/edit/:id', controller.getEdit);
// router.post('/edit/:id', controller.postEdit);

// router.get('/delete/:id', controller.getDelete);

module.exports = router;
