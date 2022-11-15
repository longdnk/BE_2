const mongoose = require('mongoose')

const portfolioSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },

    avata_name: {
        type: String,
        trim: true,
    },
    avata_path: {
        type: String,
        trim: true,
    },
    avata_file: {
        type: String,
        trim: true,
    },

    description: {
        type: String,
        required: false,
    },
    is_active: {
        type: Number,
    },
    domain: {type: mongoose.Schema.Types.ObjectId, ref: 'Domain'},
    sites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Site'}],
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],    
    created_at: {
        type: Date,
        default: Date.now
    },
})

const portfolio = mongoose.models.portfolio || mongoose.model('portfolio', portfolioSchema)

module.exports = portfolio
