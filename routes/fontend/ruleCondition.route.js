const express = require('express')
const controller = require('../../controllers/fontend/rule.controller')
// const validator = require('express-validator');
const validator = require('../../middlewares/validation')
const auth = require('../../middlewares/auth')
const router = express()

router.get('/', auth, controller.getRuleConditions);


module.exports = router