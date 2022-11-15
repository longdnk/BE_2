const express = require('express');
const router = express.Router();
router.use(express.static(__dirname + './public'));
const controller = require('../../controllers/admin/user.controller');
const {adminValidate} = require('../../middlewares/validation')


//UM0008
router.get('/:id/duplicate', controller.duplicateUser);
//UM0002
router.get('/:id', controller.getUserDetail)
//UM0004
router.post('/:id',adminValidate('updateUser'), controller.updateUser)
//UM0005
router.delete('/:id', controller.deleteUser);
//UM0001
router.get('/', controller.getUsers)
//UM0007
router.post('/', adminValidate('createUser'), controller.createUser);

module.exports = router;
