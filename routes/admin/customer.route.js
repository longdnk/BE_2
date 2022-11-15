const express = require('express');
const controller = require('../../controllers/admin/customer.controller');
const validator = require('../../middlewares/validation');
const router = express();

//SM00004
router.get('/:id', controller.getCustomerDetails);
//SM00005
router.post('/:id', validator.adminValidate('updateCustomer'), controller.postUpdateCustomer);
//SM00006
router.delete('/:id', controller.deleteCustomer);
//SM00001
router.get('/', controller.getAllCustomers);
//SM00003
router.post('/', validator.adminValidate('createCustomer'), controller.postAddCustomer);

module.exports = router