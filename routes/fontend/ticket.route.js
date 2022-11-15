const express = require('express')
const controller = require('../../controllers/fontend/event.controller')
const router = express()

router.post('/tickets', controller.postCreateTicket)
router.delete('/tickets/:id', controller.postDeleteTicket)
router.put('/tickets/:id', controller.postEditTicket)
module.exports = router