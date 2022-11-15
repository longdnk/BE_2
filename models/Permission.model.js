const mongoose = require('mongoose')
const validator = require('validator')

const permissionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    route: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    },
})

const permission = mongoose.model('permission', permissionSchema)

module.exports = permission
