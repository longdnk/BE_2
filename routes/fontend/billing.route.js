const express = require('express')
const controller = require('../../controllers/fontend/billing.controller')
const auth = require('../../middlewares/auth')
const router = express()

router.get('/:id', auth, controller.getBilling)
router.get('/:id/cost-trend', auth, controller.ConstTrend)
router.get('/:id/invoice', auth, controller.InvoiceList)
router.get('/:id/invoice/:invoiceId', auth, controller.InvoiceDetail)
router.get('/:id/billing-scheme', auth, controller.BillingConfig)
router.get('/:id/billing-scheme/:billingSchemeId', auth, controller.BillingConfigById)
module.exports = router