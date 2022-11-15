const mongoose = require('mongoose')

const deviceModelSchema = mongoose.Schema({
    producer: {
        type: String,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    paras_model: {
        type: Object,
        required: true,
    },
    protocol: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'protocol' 
    },
    type: {
        type: String,
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

const deviceModel = mongoose.model('deviceModel', deviceModelSchema, 'device_model')

module.exports = deviceModel;

