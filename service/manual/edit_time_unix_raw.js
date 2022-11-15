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
  let bm_date = moment('2022-06-15 01:30:13', "YYYY-MM-DD hh:mm:ss"); // moment('2022-06-17 00:30:13.782+07:00')
  let end_date = moment('2022-06-19 12:10:00', "YYYY-MM-DD hh:mm:ss");

  const filter = {  
    timestamp:  { $gte: bm_date}, 
    //updated_at: {$lte: end_date},
    is_updated: { $lte: 1}
  };

  let data = await DeviceRawData.findOne(filter);
  console.log(data.timestamp)

  let dt = moment(data.timestamp);

  const update = {
    is_updated: 2,
    timestamp_unix: dt.unix()
  };

  let doc = await DeviceRawData.findOneAndUpdate({_id: data._id}, update );
  console.log('--->', data.timestamp)
}

let i  = 0

setInterval(function() {

  console.log('---> ', i);

  manu_edit()
  i++
}, 1000);



