const mongoose = require('mongoose')
const validator = require('validator')

const ruleOperatorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        
    },
    description: {
        type: String,
        
    },
    code: {
        type: String,
        required: true,
        unique: true,
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

const RuleOperator = mongoose.model('RuleOperator', ruleOperatorSchema, 'rule_operator')

module.exports = RuleOperator
