const express = require('express')
const controller = require('../../controllers/admin/panelType.controller')
const validator = require('../../middlewares/validation')
const router = express()


//PA00003
router.get('/:id', controller.getUpdatePanel);
//PA00004
router.post('/:id', validator.adminValidate('updatePanel'), controller.postUpdatePanel);
//PA00005
router.delete('/:id', controller.deletePanel);
//PA00001
router.get('/', controller.getPanelTypes);
//PA00002
router.post('/', validator.adminValidate('createPanel'), controller.postAddPanel);

module.exports = router
