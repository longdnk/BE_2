const express = require('express')
const controller = require('../../controllers/fontend/rule.controller')
// const validator = require('express-validator');
const validator = require('../../middlewares/validation')
const auth = require('../../middlewares/auth')
const router = express()

// router.get('/conditions/list', auth, controller.getRuleConditions);
// router.get('/devices/list', auth, controller.getDevicesInPlant);
router.get('/:id', auth, controller.getRuleDetails);
router.post('/:id', auth,validator.validate('updateRule'), controller.postUpdate);
router.delete('/:id', auth, controller.delete);
router.get('/', auth, validator.validate('listAllRules'), controller.getListRule);
router.post('/', auth, validator.validate('createRule'), controller.postAdd);

module.exports = router