const express = require('express');
const controller = require('../../controllers/admin/inverter.controller');
const router = express();
const {adminValidate} = require('../../middlewares/validation')

//IN00003
router.get('/:id', controller.getInverter)
//IN00005.0
router.get('/:id/config/update', adminValidate('getUpdateConfig'),controller.getUpdateConfig)
//IN00005.1
router.post('/:id/config/update', adminValidate('updateConfig'), controller.postUpdateConfig)
//IN00005.2
router.post('/:id/config/delete', adminValidate('deleteConfig'), controller.postDeleteConfig)
//IN00005.3
router.post('/:id/config/create', adminValidate('createConfig'), controller.postCreateConfig)
//IN00005
router.post('/:id', adminValidate('updateInverter'), controller.postUpdateInverter)
//IN00006
router.delete('/:id', controller.deleteInverter)
//IN00004
router.post('/', adminValidate('createInverter'), controller.postAddInverter)
//IN00002
router.get('/', controller.getInverters)

module.exports = router