require('dotenv').config();
var moment = require('moment'); // require
const CronJob = require('cron').CronJob;
//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true});

const Device = require('../../models/Device.model')
const KwhDevice3 = require('../../models/KwhDevice3.model')
const DeviceRawData = require('../../models/DeviceRawData.model')
const SensorDate = require('../../models/SensorDate.model')
const HistoryDeviceRawData = require('../../models/HistoryDeviceRawData.model')


// //========================================================
// // Run job stored w device (every 10 minutes)
// var CalcSensorDateJob = new CronJob('*/20 * * * *', function() {
//   StoredSensorDate(moment())
//   //StoredWhStation3PriceAuto()
//   //console.log('-----------> ' + moment().format('hh:mm:ss'))
// }, null, true, 'Asia/Ho_Chi_Minh');

// CalcSensorDateJob.start();
// //========================================================
StoredSensorDate(moment())


async function StoredSensorDate(date){
  //console.log(date)
  let start_date = moment(date).startOf('day')  
  let start_date1 = moment(date).startOf('day').add(5, 'minutes')  

  let end_date = moment(date).endOf('day')  
  let end_date1 = moment(date).endOf('day').add(5, 'minutes')  

  //console.log(start_date, end_date)

  let devices = await Device.find({is_active: 1, type: {$in: ['smp3', 'sensor'] } });
  console.log(devices)
  for (let j = 0; j < devices.length; j++) {
    let device = devices[j]

      let dt = {
        device: device._id,
        device_name : device.name,
        device_code : device.code,
        timestamp : start_date,
        updated_at: new Date(),
        plant: device.plant,
        watts: []
      }

      dt.timestamp_unix = moment(dt.timestamp).unix()
      dt.daily_irradtn =  await getDailyIrradtnMax(device.code, start_date1, end_date1)

      const filter = {  timestamp: dt.timestamp, 
                        device_code: device.code, 
                        device: device._id,
                      };

      const update = dt;

      let doc = await SensorDate.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true  // Make this update into an upsert
      });
    
      
  }
  
}


  
async function getDailyIrradtnMax(device_code, start, end){
  let infors = await DeviceRawData.find({ device: device_code, 
                                          type: {$in: ['smp3', 'sensor'] },
                                          timestamp: {$gte: start, $lte: end } 
                                      })

                                      //console.log(infors)
  let max = 0
  
  infors.map(async function(item){
    //console.log(item)
    let rs = item.paras.filter(function(it){
      return it.dailyIrradtn;
    })

    let di = rs[0] ? parseFloat(rs[0].dailyIrradtn) : 0
    if (di > 0) {
      max = di >= max ? di : max
    }
  })

  return  max
}


module.exports = {
  StoredSensorDate
}
  