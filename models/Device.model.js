const mongoose = require('mongoose')
const deviceSchema = mongoose.Schema({
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
        //unique: true,
    },
    type: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    pStrings: {
        type: Number
    },
    paras: {
        type: Object ,
    },
    manufacture: {
        type: String,
    },
    model: {
        type: String,
    },
    version: {
        type: String,
    },
    type: {
        type: String,
    },
    SN: {
        type: String,
    },
    deviceAddress: {
        type: Number,
    },
    nameplateWatts: {
        type: Number,
    },
    is_active: {
        type: Number,
        default: 1,
    },
    status: {
        type: Number,
        default: 10
    },
    device_model:{type: mongoose.Schema.Types.ObjectId, ref: 'DeviceModel' },
    // site: {type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
    plant: {type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
    // iot_device: {type: mongoose.Schema.Types.ObjectId, ref: 'IotDevice' },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    }
})

const Device = mongoose.model('Device', deviceSchema)

module.exports = Device