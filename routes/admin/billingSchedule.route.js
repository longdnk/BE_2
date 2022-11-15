const express = require('express');
const controller = require('../../controllers/admin/billingSchedule.controller');
const validator = require('../../middlewares/validation');
const router = express();

//BS00004
router.get('/:id', controller.getBillingScheduleDetails);
//BS00005
router.post('/:id', validator.adminValidate('updateBillingSchedule'), controller.postUpdateBillingSchedule);
//BS00006
router.delete('/:id', controller.deleteBillingSchedule);
//BS00001
router.get('/', controller.getAllBillingSchedules);
//BS00003
router.post('/', validator.adminValidate('createBillingSchedule'), controller.postAddBillingSchedule);
module.exports = router
