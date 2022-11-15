const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const IndexPlantSchema = mongoose.Schema({
    kwh_td_index: {
        type: Number,
        default: 0,
    },
    kwh_bt_index: {
        type: Number,
        default: 0,
    },
    kwh_cd_index: {
        type: Number,
        default: 0,
    },
    old_kwh_td_index: {
        type: Number,
        default: 0,
    },
    old_kwh_bt_index: {
        type: Number,
        default: 0,
    },
    old_kwh_cd_index: {
        type: Number,
        default: 0,
    },
    total_kwh:{
        type: Number,
        default: 0,
    },
    billing_code: {
        type: String,
        trim: true,
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

    timestamp_unix: {
        type: Number,
    },
    is_active: {
        type: Number,
        default: 1,
    },
    //device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    plant: {type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
})


const IndexPlant = mongoose.model('IndexPlant', IndexPlantSchema, 'index_plant')

module.exports = IndexPlant
