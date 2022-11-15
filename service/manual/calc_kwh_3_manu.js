require('dotenv').config();
var moment = require('moment'); // require

//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true});

const Device = require('../../models/Device.model')
const KwhDevice3 = require('../../models/KwhDevice3.model')
const DeviceRawData = require('../../models/DeviceRawData.model')
const HistoryDeviceRawData = require('../../models/HistoryDeviceRawData.model')


manu()

function manu(argument) {
  let date = moment('21-06-2022 00:00:00',"DD-MM-YYYY hh:mm:ss")
  let end =  moment('23-06-2022 00:59:59',"DD-MM-YYYY hh:mm:ss")


  setInterval(async function() {
    
    console.log('------> ', date);
    if(date <= end){
      await StoredWhDeviceData3(date)
      console.log('-> done: ->', date);
      date = date.add(1, 'days')
    }

    
  }, 15000);

  
}


async function StoredWhDeviceData3(date){
  //console.log(date)
  //try{
    //let start = moment(start1).startOf('days')
    let station = "607c7e23ba23121608c8fc69";
    let strDate = moment(date).format('DD-MM-YYYY') + " "
    const hours_arrs = [
        {code: 0, name: 'TD', description: '00h00->04h00', min: strDate +'00:00:00', max: strDate +'04:00:00' },
        {code: 1, name: 'BT', description: '4h00->9h30',  min: strDate +'04:00:00', max: strDate +'09:30:00' },
        {code: 2, name: 'CD', description: '9h30->11h30', min: strDate +'09:30:00', max: strDate +'11:30:00' },
        {code: 3, name: 'BT', description: '11h30->17h00', min: strDate +'11:30:00', max: strDate +'17:00:00' },
        {code: 4, name: 'CD', description: '17h00->20h00', min: strDate +'17:00:00', max: strDate +'20:00:00' },
        {code: 5, name: 'BT', description: '20h00->22h00', min: strDate +'20:00:00', max: strDate +'22:00:00' },
        {code: 6, name: 'TD', description: '22h00->24h00', min: strDate +'22:00:00', max: strDate +'24:00:00' },
      ]

    //let point = await getPoint(hours_arrs, now)
  

    let devices = await Device.find({is_active: 1, type: 'Inverter'});
    for (let j = 0; j < devices.length; j++) {
      let device = devices[j]
      for (var i = 0; i < hours_arrs.length; i++) {

        let dt = {
          device: device._id,
          device_name : device.name,
          device_code : device.code,
          timestamp : moment(strDate + '00:00:00', "DD-MM-YYYY hh:mm:ss"),
          updated_at: new Date(),
          type_number: hours_arrs[i].code,
          type_name: hours_arrs[i].name,
          type_description: hours_arrs[i].description,
          plant: device.plant,
          watts: []
        }

        dt.timestamp_unix = moment(dt.timestamp).unix()

        let now = moment(hours_arrs[i].min, "DD-MM-YYYY hh:mm:ss").add(1, 'minutes')
        let point = await getPoint(hours_arrs, now)

      
        let current_max = await getkWhMax(device.code, point.current_start , point.current_end)
        let premax_max = await getkWhMax(device.code, point.pre_start, point.pre_end)

        dt.kwh_min = premax_max.max
        dt.kwh_max = current_max.max

        let min
        if(dt.kwh_min == 0){
          min = await getkWhMin(device.code, point.current_start, point.current_end)
          dt.kwh_min = min.min
        }
        
        if(dt.kwh_max == 0){
          dt.kwh_max = dt.kwh_min
        }
      
        if(dt.kwh_max > 0 && dt.kwh_min > 0 ){
          dt.kwh = dt.kwh_max -  dt.kwh_min
        }else{
          dt.kwh = 0
        }

        const filter = {  timestamp: dt.timestamp, 
                          device_code: device.code, 
                          device: device._id,
                          type_number: point.infor.code
                        };

        const update = dt;

        let doc = await KwhDevice3.findOneAndUpdate(filter, update, {
          new: true,
          upsert: true  // Make this update into an upsert
        });
      }
        
    }
  // }catch(error){
  //   console.log(error.message)
  // }
}

async function getPoint(hours_arrs, now){
  let point
  let pre_start
  let pre_end
  let pre_code

  await hours_arrs.forEach(function(e){
    if ((now > moment(e.min,  "DD-MM-YYYY hh:mm:ss")) && (now < moment(e.max,  "DD-MM-YYYY hh:mm:ss")) ){
      point = e        
    }
  })

  switch (point.code) {
    case 1:
      pre_code = 0;
      break;
    case 2:
      pre_code = 1;
      break;
    case 3:
      pre_code = 2;
      break;
    case 4:
      pre_code = 3;
      break;
    case 5:
      pre_code = 4;
      break;
    case 6:
      pre_code = 5;
      break;
    case 0:
      pre_code = 6;
  }

  await hours_arrs.forEach(function(e){
    if(point.code == 0 && e.code == 6){
      //let start = moment(now).subtract(1, 'days').startOf('day').format('DD-MM-YYYY') + " "
      pre_start = moment(e.min,  "DD-MM-YYYY hh:mm:ss").subtract(1, 'days')
      pre_end = moment(e.max,  "DD-MM-YYYY hh:mm:ss").subtract(1, 'days')
      //console.log(pre_start, pre_end)
    }else{
      if (e.code == pre_code ){
        pre_start = moment(e.min,  "DD-MM-YYYY hh:mm:ss")
        pre_end = moment(e.max,  "DD-MM-YYYY hh:mm:ss")
          
      }
    }
    
  })


  let d = {
    current_start : moment(point.min,  "DD-MM-YYYY hh:mm:ss"),
    current_end : moment(point.max,  "DD-MM-YYYY hh:mm:ss"),
    pre_start: pre_start,
    pre_end: pre_end,
    infor: point,
  }
  return  d;
  
}
  
async function getkWhMax(device_code, start, end){
  let data = []
  let infors = await DeviceRawData.find({ device: device_code, 
                                          timestamp: {$gte: start, $lte: end } 
                                      })

  let maxWh = 0
  let maxAt
  
  infors.map(async function(item){
    let strWh = item.paras.filter(function(it){
      return it.kWH;
    })
    let WH = strWh ? parseInt(strWh[0].kWH) : 0
    //console.log(item.device, strWh[0], WH, start, end)

    if (WH > 0) {
      maxWh = WH >= maxWh ? WH : maxWh
      if (WH >= maxWh) {
        maxAt = new Date()
      }
    }
  })

  return {max: maxWh, maxAt: maxAt } 
}

async function getkWhMin(device_code, start, end){
  let data = []
  let infors = await DeviceRawData.find({  device: device_code, 
                                        timestamp: {$gte: start, $lte: end } 
                                    })

  let minWh = 999999999
  let minAt;
  infors.map(async function(item){
    let strWh = item.paras.filter(function(it){
      return it.kWH;
    })
    let WH = strWh ? parseInt(strWh[0].kWH) : 0

    if (WH > 0) {
      minWh = WH <= minWh ? WH : minWh
      if (WH <= minWh) {
        minAt = new Date()
      }
    }
  })
  if(minWh == 999999999 ){
    minWh = 0
  }

  return {min: minWh, minAt: minAt } 
}
  