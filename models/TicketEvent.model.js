const mongoose = require('mongoose')
const validator = require('validator')

const ticketSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    site: {type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
    plant: {type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
    event: {type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    status: {
        type: String,
    },
    sla: {
        type: String,
    },
    start_time: {
        type: Date
    },
    due_time: {
        type: Date
    },
    persion_in_charge: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    is_send_email: {
        type: Number
    },
    description: {
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

const ticket = mongoose.model('ticket', ticketSchema)

module.exports = ticket
