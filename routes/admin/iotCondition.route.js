const express = require('express')
const controller = require('../../controllers/admin/iot.controller')
const validator = require('../../middlewares/validation')
const router = express()

//IOT00002
router.get('/', controller.getNextIotCode);

module.exports = router;