const express = require('express')
const controller = require('../../controllers/admin/device.controller')
const router = express()

//DC00008
router.get('/', controller.getDeviceCondition)

module.exports = router