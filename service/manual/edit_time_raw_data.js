require('dotenv').config();
const CronJob = require('cron').CronJob;
var moment = require('moment'); // require
//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true});

const DeviceRawData = require('../../models/DeviceRawData.model')
//const HistoryDeviceRawData = require('../models/HistoryDeviceRawData.model')

//========================================================
async function manu_edit(){
  let bm_date = moment('2022-06-17 01:30:13', "YYYY-MM-DD hh:mm:ss"); // moment('2022-06-17 00:30:13.782+07:00')
  let end_date = moment('2022-06-18 12:10:00', "YYYY-MM-DD hh:mm:ss");

  const filter = {  
    timestamp:  { $gte: bm_date}, 
    updated_at: {$lte: end_date},
    is_updated: 0
  };

  let data = await DeviceRawData.findOne(filter);
  console.log(data.timestamp)

  let dt = moment(data.timestamp).subtract(7, 'hours');

  const update = {
    is_updated: 1,
    timestamp: dt,
    timestamp_unix: dt.unix() * 1000
  };

  let doc = await DeviceRawData.findOneAndUpdate({_id: data._id}, update );
  console.log('--->', data.timestamp)
}

let i  = 0

setInterval(function() {

  console.log('---> ', i);

  manu_edit()
  i++
}, 3000);



