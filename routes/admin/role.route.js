const express = require('express');
const controller = require('../../controllers/admin/role.controller');
const router = express();
const {adminValidate} = require('../../middlewares/validation');

//RM0002
router.get('/:id', controller.getRoleDetail)
//RM0004
router.post('/:id', adminValidate('updateRole'), controller.updateRole)
//RM0005
router.delete('/:id', controller.deleteRole)
//RM0007
router.post('/', adminValidate('createRole'), controller.createRole)
//RM0001
router.get('/', controller.getRolesAndPermissions)

module.exports = router