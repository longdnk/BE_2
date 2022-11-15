const mongoose = require('mongoose')

const deviceRawDataSchema = mongoose.Schema({
    domain: {
        type: String,
    },
    portfolio: {
        type: String,
    },
    site: {
        type: String,
    },
    plant: {
        type: String,
    },
    device: {
        type: String,
    },

    paras: {
        type: Object,
        required: true,
        trim: true,
    },
    value: {
        type: Number,
        trim: true,
    },
    unit: {
        type: String,
        trim: true,
    },
    dataType: {
        type: String,
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    timestamp_unix: {
        type: Number,
    },
    
    updated_at: {
        type: Date,
    },
    watts: {
        type: Number,
    },
    type: {
        type: String,
    },
    is_updated: {
        type: Number,
        default: 0,
    },
    is_active: {
        type: Number,
        default: 1,
    },

    is_check_rule: {
        type: Number,
        default: 0,
    },
    note: {
        type: String,
        //trim: true,
    },

    
    //device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    //station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
    // password: {
    //     type: String,
    //     required: true,
    //     minLength: 5
    // },
    // tokens: [{
    //     token: {
    //         type: String,
    //         required: true
    //     }
    // }]
})



const DeviceRawData = mongoose.model('DeviceRawData', deviceRawDataSchema, 'device_raw_data')

module.exports = DeviceRawData
