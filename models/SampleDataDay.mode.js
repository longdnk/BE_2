const mongoose = require('mongoose')

const SampleDataSchema = mongoose.Schema({
    value: {
        type: Number,
        trim: true,
    },
    timestamp: {
        type: Number,
        trim: true
    },
    created_at: {
        type: Date,
      
    },  
})



const SampleData = mongoose.model('Sampledataday', SampleDataSchema)

module.exports = SampleData
