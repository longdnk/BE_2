const mongoose = require('mongoose')
const validator = require('validator')

const ruleConfigSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    rule_type: {
        type: Number, 
    },
    rule_time: {
        type: String, 
    },
    plant: {type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
    device: [{type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
    rule_field: {type: mongoose.Schema.Types.ObjectId, ref: 'RuleField' },
    rule_operator: {type: mongoose.Schema.Types.ObjectId, ref: 'RuleOperator' },

    value: {
        type: Number,
        required: true,
    },
    severity: {
        type: Number, 
    },

    message: {
        type: String, 
    },

    email: {
        type: Boolean, 
    },

    phone: {
        type: Boolean, 
    },
    sms: {
        type: Boolean, 
    },
    recipients: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    others : {
        type: Array,
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

const RuleConfig = mongoose.model('RuleConfig', ruleConfigSchema, 'rule_config')

module.exports = RuleConfig
