const express = require('express')
const controller = require('../../controllers/admin/iotPlantConnection.controller')
const validator = require('../../middlewares/validation')
const router = express()


//IP00001
router.get('/', controller.getConditions);
module.exports = router
