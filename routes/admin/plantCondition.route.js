const express = require('express')
const controller = require('../../controllers/admin/plant.controller')
const router = express()

//PLC0003
router.get('/', controller.getPlantCondition);

module.exports = router