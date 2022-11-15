const mongoose = require('mongoose')

const BillingConfigSchema = mongoose.Schema({
    plant: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Plant',
    },
    plant_name: {
        type: String,
        trim: true
    },
    price_30: { // Gia cao diem
        type: Number
    },
    price_20: { // Gia binh thuong
        type: Number
    },
    price_10: { // Gia thap diem
        type: Number
    },
    tax: {
        type: Number
    },
    vat: {
        type: Number
    },
    discount: {
        type: Number
    },
    infor: {
        type: String
    },
    timestamp: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
})

const BillingConfig = mongoose.model('BillingConfig', BillingConfigSchema, 'billing_config')
module.exports = BillingConfig