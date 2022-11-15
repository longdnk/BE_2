const express = require('express')
const controller = require('../../controllers/admin/portfolio.controller')
const router = express()

// router.get('/list', controller.getList)
// router.post('/add', controller.postAdd)
// router.post('/addsite', controller.postAddSite)

//PC0008
router.post('/:id/assign-sites',controller.assignSites)
//PC0010
router.post('/:id/remove-sites', controller.removeSite)
//PC0002
router.get('/:id', controller.getDetailPortfolio);
//PC0006
router.post('/:id', controller.postUpdatePortfolio);
//PC0011
router.delete("/:id", controller.deletePorfolio)
//PC0004
router.post('/', controller.postAddPortfolios);
//PC0001
router.get('/', controller.getPortfolios);

module.exports = router