const mongoose = require('mongoose')

const CustomerSchema = mongoose.Schema({
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    code: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
    },
    tax_number: {
        type: String,
    },
    address_use: {
        type: String,
    },
    
    purpose: {
        type: String,
    },
    type: {
        type: String,
    },

    infors: {
        type: Array,
    },
    
    timestamp: {
        type: Date,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    
    // plant_name: {
    //     type: String,
    //     trim: true,
    // },

    timestamp_unix: {
        type: Number,
    },
    is_active: {
        type: Number,
        default: 1,
    },
    // plant: {
    //     type: mongoose.Schema.Types.ObjectId, 
    //     ref: 'Plant' 
    // },
})


const Customer = mongoose.model('Customer', CustomerSchema, 'customers')

module.exports = Customer
