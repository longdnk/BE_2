const mongoose = require('mongoose')

const domainSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        required: false,
    },
    is_active: {
        type: Number,
    },
    portfolios: [{type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio'}],   
    created_at: {
        type: Date,
        default: Date.now
    }, 
})

const domain = mongoose.models.domain || mongoose.model('domain', domainSchema)

module.exports = domain
