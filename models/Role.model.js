const mongoose = require('mongoose')
const validator = require('validator')

const roleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    permissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    },
})

const role = mongoose.model('role', roleSchema)

module.exports = role
