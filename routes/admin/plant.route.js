const express = require('express')
const controller = require('../../controllers/admin/plant.controller')
const router = express()

//PLC0005
router.post('/:id/update-basic', controller.postUpdateBasic);
//PLC0006
router.post('/:id/update-sup-cus', controller.postUpdateSupCus);
//PLC0009
router.post('/:id/assign-devices',controller.assignDevices)
//PLC0011
router.post('/:id/remove-devices', controller.removeDevices)
//PLC0002
router.get('/:id', controller.getPlantDetails);
//PLC0012
router.delete('/:id', controller.deletePlant)
//PLC0004
router.post('/', controller.postAddPlant);

module.exports = router