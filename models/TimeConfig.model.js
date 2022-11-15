const mongoose = require('mongoose')

const TimeConfigSchema = mongoose.Schema({
    plant: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Plant',
    },
    plant_name: {
        type: String,
        trim: true
    },
    days: {
        type: String
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

const TimeConfig = mongoose.model('TimeConfig', TimeConfigSchema, 'time_config')
module.exports = TimeConfig