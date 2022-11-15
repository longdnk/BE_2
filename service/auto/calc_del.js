require('dotenv').config();
var moment = require('moment');
var mongoose = require('mongoose');
//---------------------------------------------------------------------
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true});

// Defind model
const DeviceRawData = require('../../models/DeviceRawData.model')
const HistoryDeviceRawData = require('../../models/HistoryDeviceRawData.model')
const DeviceRawRealtime = require('../../models/DeviceRawRealtime.model')
//---------------------------------------------------------------------


//---------------------------------------------------------------------
// Service to delete database after 2 days
let before_day;
module.exports.delete_realtime = async function() {
  before_day = moment().subtract(3, 'days');
  await DeviceRawRealtime.deleteMany({ timestamp: { $lte: before_day } });
}
//---------------------------------------------------------------------
