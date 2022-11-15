const mongoose = require('mongoose')

const eventSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        //required: true,
    },
    severity: {
        type: Number,
        //required: true,
    },
    scope: {
        type: String,
        //required: true,
    },
    beginning_time: {
        type: Date,
        //required: true,
    },
    event_type: { //rule /iot
        type: String,   
    },
    rule_type: { //device /plant
        type: String,   
    },
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    plant: {type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
    site: {type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
})

const UEvent = mongoose.model('UEvent', eventSchema, 'events')

module.exports = UEvent
