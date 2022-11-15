const mongoose = require('mongoose')
const validator = require('validator')

const ruleFieldSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        
    },
    unit: {
        type: String,
    },

    is_active: {
        type: Number,
        default: 1,
    },

    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
})

const RuleField = mongoose.model('RuleField', ruleFieldSchema, 'rule_field')

module.exports = RuleField
