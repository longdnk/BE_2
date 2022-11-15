const mongoose = require('mongoose')

const panelSchema = mongoose.Schema({
    producer: {
        type: String,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    power: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
    },
    __v: {
        type:String,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    },
})

const Panel = mongoose.model('Panel', panelSchema, 'panel_type')

module.exports = Panel;
