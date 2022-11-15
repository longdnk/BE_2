const mongoose = require('mongoose')

const budgetSchema = mongoose.Schema({
    budget_production: {
        type: Number,
    },
    budget_performance_ratio: {
        type: Number,
    },
    budget_specific_yield: {
        type: Number,
    },
    month: {
        type: String,
    },
    plant: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Plant',
    },
    timestamp_unix:{
        type: Number,
    },
    plant_name: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    }
})

const budget = mongoose.model('budget', budgetSchema, 'plant_budget_monthlies')

module.exports = budget
