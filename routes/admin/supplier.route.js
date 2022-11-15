const express = require('express');
const controller = require('../../controllers/admin/supplier.controller');
const validator = require('../../middlewares/validation');
const router = express();

//SM00004
router.get('/:id', controller.getSupplierDetails);
//SM00005
router.post('/:id', validator.adminValidate('updateSupplier'), controller.postUpdateSupplier);
//SM00006
router.delete('/:id', controller.deleteSupplier);
//SM00001
router.get('/', controller.getAllSuppliers);
//SM00003
router.post('/', validator.adminValidate('createSupplier'), controller.postAddSupplier);

module.exports = router