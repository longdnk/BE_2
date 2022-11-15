const express = require('express')
const controller = require('../../controllers/admin/domain.controller')
const router = express()

router.get('/list', controller.getList)
router.post('/add', controller.postAdd)

module.exports = router