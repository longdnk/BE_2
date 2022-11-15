const express = require('express')
const controller = require('../../controllers/fontend/plant.controller')
const auth = require('../../middlewares/auth')
const router = express()

router.get('/:id',  auth, controller.getPlantDetail)
router.get('/:id/detail', auth, controller.ChartDetail)
module.exports = router