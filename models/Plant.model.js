const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

const plantSchema = mongoose.Schema({
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
    },
    commissioningOn: {
        type: String,
    },
    address: {
        type: String,
    },
    modules: {
        type: String,
    },
    southOrientation: {
        type: String,
    },
    tilt: {
        type: String,
    },
    inverter: {
        type: String,
    },
    capacity: {
        type: Number
    },
    // budgetSpecificYield: {
    //     type: SchemaTypes.Double
    // },
    // performanceRatioBudget: {
    //     type: SchemaTypes.Double
    // },
    pArray: {
        type: SchemaTypes.Double
    },
    lat: {
        type: SchemaTypes.Double
    },
    lng: {
        type: SchemaTypes.Double
    },
    is_active: {
        type: Number,
    },
    // unit_price_cd:{
    //     type: Number,
    //     default: 0,
    // },
    
    // unit_price_bt:{
    //     type: Number,
    //     default: 0,
    // },

    // unit_price_td:{
    //     type: Number,
    //     default: 0,
    // },
    // discount:{
    //     type: Number,
    //     default: 0,
    // },
    // vat:{
    //     type: Number,
    //     default: 0,
    // },
    site: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Site'
    },
    devices: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Device'
    }],
    users: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }],    
    created_at: {
        type: Date,
        default: Date.now
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Supplier'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer'
    }
})

const plant = mongoose.models.plant || mongoose.model('plant', plantSchema)

module.exports = plant
