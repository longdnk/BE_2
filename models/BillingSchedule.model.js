const mongoose = require('mongoose')
const validator = require('validator')

const BillingScheduleSchema = mongoose.Schema({
    start_day: {
        type: String,
    },
    start_day_premonth: {
        type: Number,
        default: 0,
    },
    end_day: {
        type: String,
    },
    end_day_premonth: {
        type: Number,
        default: 0,
    },
    run_day: {
        type: String,
    },

    infors: {
        type: Array,
    },
    
    timestamp: {
        type: Date,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    
    plant_name: {
        type: String,
        trim: true,
    },
    name: {
        type: String,
        trim: true,
    },
    code: {
        type: String,
        
    },

    timestamp_unix: {
        type: Number,
    },
    is_active: {
        type: Number,
        default: 1,
    },
    plant: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Plant' 
    },
})


const BillingSchedule = mongoose.model('BillingSchedule', BillingScheduleSchema, 'billing_schedule')

module.exports = BillingSchedule
