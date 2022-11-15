const mongoose = require('mongoose')

const iotSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        unique: true,
        required:true,
    },
    // plant: [{type: mongoose.Schema.Types.ObjectId, ref: 'Plant'}],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    },
})

const iot = mongoose.model('iot', iotSchema,'iot')

module.exports = iot;
