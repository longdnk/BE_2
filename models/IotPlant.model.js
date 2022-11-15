const mongoose = require('mongoose')

const iotPlantSchema = mongoose.Schema({
    iot:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Iot',
        required: true,
    },
    iot_code: {
        type: String,
    },
    plant:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Plant',
        required: true,
    },
    plant_code: {
        type: String,
    },
    devices:{
        type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Device'}],
        required: true,
    },
    infor:{
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    },
})

const iotPlant = mongoose.model('iotPlant', iotPlantSchema,'iot_plant')

module.exports = iotPlant;
