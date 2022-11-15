const express = require('express')
const controller = require('../../controllers/admin/site.controller')
const router = express()

//SC0003
router.get('/', controller.getSiteCondition);


module.exports = router