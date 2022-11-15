const mongoose = require('mongoose')

const loggerSchema = mongoose.Schema({
    name: {
        type: String,
        //required: true,
        //unique: true,
    },
    description: {
        type: String,
        //required: true,
    },
    type: {
        type: String,   
        //required: true,
    },
    infor: {
        type: Array,   
        //required: true,
    },
    //permissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
})

const Logger = mongoose.model('Logger', loggerSchema, 'loggers')

module.exports = Logger
