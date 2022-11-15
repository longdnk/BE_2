const express = require('express')
const controller = require('../../controllers/admin/protocol.controller')
const validator = require('../../middlewares/validation')
const router = express()


//PR00003
router.get('/:id', controller.getUpdate);
//PR00004
router.post('/:id', validator.adminValidate('updateProtocol'), controller.postUpdate);
//PR00005
router.delete('/:id', controller.delete);
//PR00001
router.get('/', controller.getAllProtocols);
//PR00002
router.post('/', validator.adminValidate('createProtocol'), controller.postAdd);
module.exports = router
