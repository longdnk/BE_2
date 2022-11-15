const express = require('express')
const controller = require('../../controllers/admin/portfolio.controller')
const router = express()

//PC0003
router.get('/', controller.getPortfolioCondition);

module.exports = router