const mongoose = require('mongoose')

const SensorDateSchema = mongoose.Schema({
    daily_irradtn: {
        type: Number,
        required: true,
    },
    wh_min: {
        type: Number,
    },
    wh_max: {
        type: Number,
    },
    kwh_min: {
        type: Number,
    },
    kwh_max: {
        type: Number,
    },
    type_number:{
        type: String,
    },
    type_name: {
        type: String,
    },
    type_description: {
        type: String,
    },
    infors: {
        type: Array,
    },
    
    timestamp: {
        type: Date,
    },
    timestamp_unix: {
        type: Number,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    device_name: {
        type: String,
        trim: true,
    },
    device_code: {
        type: String,
        trim: true,
    },
    plant_code: {
        type: String,
        trim: true,
    },
    site_code: {
        type: String,
        trim: true,
    },
    site_code: {
        type: String,
        trim: true,
    },
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    plant: {type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
})



const SensorDate = mongoose.model('SensorDate', SensorDateSchema, 'sensor_date')

module.exports = SensorDate
