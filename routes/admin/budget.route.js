const express = require('express');
const controller = require('../../controllers/admin/budget.controller');
const validator = require('../../middlewares/validation');
const router = express();

//BS00004
router.get('/:id', controller.getBudgetDetails);
//BS00005
router.post('/:id', validator.adminValidate('updateBudget'), controller.postUpdateBudget);
//BS00001
router.get('/', controller.getAllBudgets);
//BS00003
router.post('/', validator.adminValidate('createBudget'), controller.postAddBudget);
module.exports = router