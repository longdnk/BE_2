const express = require('express');
const controller = require('../../controllers/admin/billingConfig.controller');
const validator = require('../../middlewares/validation');
const router = express();

//BC00004
router.get('/:id', controller.getBillingConfigDetails);
//BC00005
router.post('/:id', validator.adminValidate('updateBillingConfig'), controller.postUpdateBillingConfig);
//BC00001
router.get('/', controller.getAllBillingConfigs);
//BC00003
router.post('/', validator.adminValidate('createBillingConfig'), controller.postAddBillingConfig);

module.exports = router