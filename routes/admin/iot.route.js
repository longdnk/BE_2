const express = require('express');
const controller = require('../../controllers/admin/iot.controller');
const validator = require('../../middlewares/validation');
const router = express();

//IOT00004
router.get('/:id', controller.getUpdateIot);
//IOT00005
router.post('/:id', validator.adminValidate('updateIot'), controller.postUpdateIot);
//IOT00006
router.delete('/:id', controller.deleteIot);
//IOT00001
router.get('/', controller.getAllIot);
//IOT00003
router.post('/', validator.adminValidate('createIot'), controller.postAddIot);

module.exports = router