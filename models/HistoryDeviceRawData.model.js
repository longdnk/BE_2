const mongoose = require('mongoose')

const historyDeviceRawDataSchema = mongoose.Schema({
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
    },
    timestamp_unix: {
        type: Number,
    },
    updated_at: {
        type: Date,
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



const HistoryDeviceRawData = mongoose.model('HistoryDeviceRawData', historyDeviceRawDataSchema, 'history_device_raw_data')

module.exports = HistoryDeviceRawData
