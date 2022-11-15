require('dotenv').config();
var moment = require('moment'); // require
//-------------------------------------------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true});

const Device = require('../../models/Device.model')
const Plant = require('../../models/Plant.model')
const KwhDevice3 = require('../../models/KwhDevice3.model')
const DeviceRawData = require('../../models/DeviceRawData.model')
const HistoryDeviceRawData = require('../../models/HistoryDeviceRawData.model');
const Price3Plant = require('../../models/Price3Plant.model');


manu()

function manu(argument) {
  let date = moment('17-07-2022 00:00:00',"DD-MM-YYYY hh:mm:ss")
  let end =  moment('18-07-2022 00:59:59',"DD-MM-YYYY hh:mm:ss")


  setInterval(async function() {
    
    console.log('------> ', date);
    if(date <= end){
      await StoredPrice3PlantAuto(date)
      console.log('-> done: ->', date);
      date = date.add(1, 'days')
    }

    
  }, 10000);

  
}

//=======================================================

async function StoredPrice3PlantAuto(date){
  //console.log(date)
  try{
    let strDate = moment(date).startOf('day')
    
    //let station_id = "6237b1c479f5fbbe6a6086a5";
    let plants = await Plant.find({is_active: 1})
    //console.log('plant ' + plants)
    if (plants.length < 1) {
      return
    }
    for (var i = 0; i < plants.length; i++) {
      let plant = plants[i]       
      
      let dt = {
        plant: plant._id,
        plant_name : plant.name,
        timestamp :  strDate, //moment(strDate + '00:00:00', "DD-MM-YYYY hh:mm:ss"),
        timestamp_unix: moment(strDate).unix(),
        updated_at: new Date(),
        unit_price_td: plant.unit_price_td,
        unit_price_bt: plant.unit_price_bt,
        unit_price_cd: plant.unit_price_cd, 
        discount: plant.discount, 
        vat: plant.vat, 
      }

        let data = await KwhDevice3.find({plant: plant._id, timestamp: dt.timestamp});

        let sum_td = 0;
        let sum_bt = 0;
        let sum_cd = 0;

        await data.forEach(e => {
          if (e.type_name == 'TD') {
            sum_td += e.kwh
          }
          if (e.type_name == 'BT') {
            sum_bt += e.kwh
          }
          if (e.type_name == 'CD') {
            sum_cd += e.kwh
          }
        })
        

        dt.kwh_td = sum_td
        dt.kwh_bt = sum_bt 
        dt.kwh_cd = sum_cd 
        dt.total_kwh_3 = sum_td + sum_bt + sum_cd

        let getKwhPlan = await getTotalKwhPlant(plant._id, date)
        dt.total_kwh = getKwhPlan.total_kwh
        dt.infors = getKwhPlan.infors
        dt.kwh_diff = dt.total_kwh - dt.total_kwh_3
        //console.log('total_kwh ' + dt.total_kwh)
        const filter = {timestamp: dt.timestamp, plant: plant._id};
        const update = dt;

        let doc = await Price3Plant.findOneAndUpdate(filter, update, {
          new: true,
          upsert: true  // Make this update into an upsert
        });
      }
      //console.log(dt)
  }catch(error){
    console.log(error.message)
  }
}


//=======================================================
// my function

async function getTotalKwhPlant(plant_id, date){
  let start = moment(date).startOf('day')
  let end =  moment(date).endOf('day')
  
  let devices = await Device.find({
    plant: plant_id,
    is_active : 1,
    type: 'inverter',
  })

  let total_kwh = 0
  let infors = []

  for (let i = 0; i < devices.length; i++) {
    const device = devices[i];

    let kwh_max = await getkWhMax(device.code, start, end)
    let kwh_min = await getkWhMin(device.code, start, end)

    total_kwh += kwh_max.max - kwh_min.min
    infors.push({
      device: device.code, 
      kwh_max: kwh_max.max, 
      kwh_min: kwh_min.min,
      kwh: kwh_max.max - kwh_min.min
    })
  }

  console.log(infors)
  return {total_kwh: total_kwh, infors: infors}
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
  