const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Price3PlantSchema = mongoose.Schema({
    kwh_td: {
        type: Number,
        default: 0,
    },
    kwh_bt: {
        type: Number,
        default: 0,
    },
    kwh_cd: {
        type: Number,
        default: 0,
    },
    total_kwh:{
        type: Number,
        default: 0,
    },

    kwh_diff: {
        type: Number,
        // default: function() {
        //     return this.total_kwh - (this.kwh_td +  this.kwh_bt + this.kwh_cd)
        // }
    },
    kwh_edit: {
        type: Number,
        default: 0,
    },
    total_kwh_3: {
        type: Number,
        // default: function() {
        //     return this.kwh_td +  this.kwh_bt + this.kwh_cd
        // }
    },
    unit_price_td:{
        type: Number,
        default: 0,
    },
    unit_price_bt:{
        type: Number,
        default: 0,
    },
    unit_price_cd:{
        type: Number,
        default: 0,
    },
    
    unit_price_diff:{
        type: Number,
        default: 0,
    },

    unit_price_edit:{
        type: Number,
        default: 0,
    },

    discount:{
        type: Number,
        default: 0,
    },

    vat:{
        type: Number,
        default: 0,
    },

    total_price:{
        type: Number,
        //default: 0,
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


const Price3Plant = mongoose.model('Price3Plant', Price3PlantSchema, 'price_3_plant')

module.exports = Price3Plant
