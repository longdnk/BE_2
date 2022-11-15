const express = require('express')
const controller = require('../../controllers/admin/site.controller')
const router = express()

//SC0008
router.post('/:id/assign-plants',controller.assignPlants)
//SC0010
router.post('/:id/remove-plants', controller.removePlants)
//SC0002
router.get('/:id', controller.getSiteDetails);
//SC0006
router.post('/:id', controller.postUpdateSite);
//SC0011
router.delete('/:id', controller.delete);
//SC0004
router.post('/', controller.postAddSite);

module.exports = router