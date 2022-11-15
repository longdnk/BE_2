const express = require('express')
const controller = require('../../controllers/admin/iotPlantConnection.controller')
const validator = require('../../middlewares/validation')
const router = express()


//IP00001
// router.get('/conditions', controller.getConditions);
//IP00003
router.get('/:id', controller.getIotPlantConnectionDetails);
//IP00004
router.post('/:id', controller.postUpdateConnection);
//IP00005
router.delete('/:id', controller.deleteConnection);
//IP00002
router.post('/', controller.postCreateConnection);
//IP00000
router.get('/', controller.getAllIotPlantConnection);
module.exports = router
