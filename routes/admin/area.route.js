var express = require('express');
var router = express.Router();

router.use(express.static(__dirname + './public'));

var controller = require('../../controllers/admin/area.controller');
const auth = require('../../middlewares/auth');

//UM0006.1
router.get('/', controller.listArea);

module.exports = router;