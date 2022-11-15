const mongoose = require('mongoose')

const SupplierSchema = mongoose.Schema({
    name: {
        type: String,
    },
    group: {
        type: String,
    },
    code: {
        type: String,
    },
    tax_number: {
        type: String,
    },
    address: {
        type: String,
    },
    contact: {
        type: String,
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
    users: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
})


const supplier = mongoose.model('Supplier', SupplierSchema, 'suppliers')

module.exports = supplier
