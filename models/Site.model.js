const mongoose = require('mongoose')

const siteSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        required: false,
    },
    unit_price_td: {
        type: Number,
    },
    unit_price_bt: {
        type: Number,
    },
    unit_price_cd: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    vat: {
        type: Number,
    },
    kwh_init: {
        type: Number,
    },
    kwh_sum: {
        type: Number,
    },
    price_init: {
        type: Number,
    },
    price_sum: {
        type: Number,
    },
    currency: {
        type: String,
        //required: false,
    },
    is_active: {
        type: Number,
    },
    status: {
        type: String,
        //required: false,
    },
    portfolio: {type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio'},
    plants: [{type: mongoose.Schema.Types.ObjectId, ref: 'Plant'}],
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    created_at: {
        type: Date,
        default: Date.now
    },    
})

const site = mongoose.models.site || mongoose.model('site', siteSchema)

module.exports = site
