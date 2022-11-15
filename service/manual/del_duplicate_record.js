require('dotenv').config();
const CronJob = require('cron').CronJob;
var moment = require('moment'); // require
//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true});

const DeviceRawData = require('../../models/DeviceRawData.model')
//const HistoryDeviceRawData = require('../models/HistoryDeviceRawData.model')

//========================================================
async function delete_duplicate_record(){
  let bm_date = moment('2022-07-15 09:40:00', "YYYY-MM-DD hh:mm:ss"); // moment('2022-06-17 00:30:13.782+07:00')
  let end_date = moment('2022-07-15 23:10:00', "YYYY-MM-DD hh:mm:ss");

  const filter = {  
    timestamp:  { $gte: bm_date}, 
    updated_at: {$lte: end_date},
    is_updated: 0
  };

  let data = await DeviceRawData.findOne(filter);
  console.log(moment(data.timestamp).format("YYYY-MM-DD HH:mm:ss"))

  let records = await DeviceRawData.find({timestamp: data.timestamp, device: data.device })
  console.log('Record: ' + records.length)
  
  if(records.length > 1){
    //Delete records
    let rs = await DeviceRawData.deleteOne({ _id: data._id });
    console.log("Deleted success" + rs.device + ' ' + rs.timestamp)
  }else{
    //Delete records
    let update = {
      is_updated: 1
    }

    let doc = await DeviceRawData.findOneAndUpdate({_id: data._id}, update );
    //console.log('--->', data.timestamp)
  }

  
}

let i  = 0

setInterval(function() {
  console.log('---> ', i);
  delete_duplicate_record()
  i++
}, 3000);



