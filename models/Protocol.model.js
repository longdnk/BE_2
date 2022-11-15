const mongoose = require('mongoose')

const protocolSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    paras_infor: {
        type: Array,
        required: true,
    },
    paras_config: {
        type: Array,
        required: true,
    },
    paras_tag: {
        type: Array,
        required: true,
    },
    __v: {
        type:String,
    },
    data_type:{
        type: Array,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    },
})

const protocol = mongoose.model('protocol', protocolSchema, 'protocol')

module.exports = protocol;
