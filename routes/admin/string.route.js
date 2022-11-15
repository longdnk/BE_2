const express = require('express')
const controller = require('../../controllers/admin/string.controller')
const router = express()

//ST00003
router.post('/:id', controller.updateString)
//ST00004
router.delete('/:id', controller.deleteString)
//ST00001
router.get('/', controller.getStringDetails)
//ST00002
router.post('/', controller.addString)

module.exports = router