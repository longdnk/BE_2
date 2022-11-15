const express = require('express')
const controller = require('../../controllers/fontend/site.controller')
const auth = require('../../middlewares/auth')
const router = express()

router.get('/select/:scope', auth, controller.getListAnalysis)
module.exports = router