const express = require('express')
const controller = require('../../controllers/admin/device.controller')
const router = express()

//DC00001
router.get('/:id/basic-details', controller.getBasicDetails)
//DC00002
router.get('/:id/paras-details', controller.getParasDetails)
//DC00003
router.get('/:id/model-details', controller.getModelDetails)
//DC00005
router.post('/:id/update-basic', controller.postBasicDetails)
//DC00006
router.post('/:id/update-paras', controller.postParasDetails)
//DC00010
router.post('/:id/duplicate', controller.duplicateDevice)
//DC00011
router.delete('/:id', controller.deleteDevice)
//DC00009
router.post('/', controller.postAddDevice)
module.exports = router