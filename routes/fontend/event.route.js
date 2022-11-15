const express = require('express')
const controller = require('../../controllers/fontend/event.controller')
const router = express()

router.get('/', controller.getListEvent)
router.get('/:eventId', controller.getDetailEvent)
module.exports = router