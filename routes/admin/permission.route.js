const express = require('express');
const controller = require('../../controllers/admin/permission.controller');
const router = express();
const {adminValidate} = require('../../middlewares/validation');
//PM0002
router.post('/:id',adminValidate('updatePermission'), controller.updatePermission);
//PM0002.1
router.get('/:id', controller.getUpdatePermission);
//PM0004
router.post('/',adminValidate('createPermission'), controller.createPermission)
//PM0001
router.get('/', controller.getList);

module.exports = router