const express = require('express')
const controller = require('../../controllers/fontend/overview.controller')
const auth = require('../../middlewares/auth')
const router = express()

router.get('/sites', auth, controller.getListSite)

//===> Duplicate Route to Update API
router.get('/sites-update', auth, controller.getListSiteNew)
//===> Duplicate Route to Update API

router.get('/plants', auth, controller.getListPlant)
module.exports = router