const mongoose = require('mongoose')

const stringSchema = mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Device',
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    pv_module: {
        type: Number,
        required: true,
    },
    panel_type: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'panel_type',
        required: true,
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

const string = mongoose.model('string', stringSchema, 'string')

module.exports = string;
