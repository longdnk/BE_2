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
const BillingSchedule = require('../../models/BillingSchedule.model');
const Invoice = require('../../models/Invoice.model');
const IndexPlant = require('../../models/IndexPlant.model');
const Customer = require('../../models/Customer.model');


//manu()

// function manu(argument) {
//   let date = moment('17-06-2022 00:00:00',"DD-MM-YYYY hh:mm:ss")
//   let end =  moment('10-07-2022 00:59:59',"DD-MM-YYYY hh:mm:ss")


//   setInterval(async function() {
    
//     console.log('------> ', date);
//     if(date <= end){
//       await StoredPrice3PlantAuto(date)
//       console.log('-> done: ->', date);
//       date = date.add(1, 'days')
//     }

    
//   }, 10000);

  
// }

//calc_billing(moment())

//=======================================================
//module.exports.calc_billing = async function(date){
async function calc_billing(date){
  try{
    let billings = await BillingSchedule.find({is_active: 1})
    let strDate = moment(date).startOf('day')

    if (billings.length < 1) {
      return
    }
    for (var i = 0; i < billings.length; i++) {
      let bill = billings[i]       
      if(bill.run_day == "Last"){
        bill.run_day = moment().endOf("month").date()
      }
      console.log(bill.run_day , moment().date())
      if(bill.run_day == moment().date()){
        //Start day -----------------------------------------------------
        let start_day           = bill.start_day
        let start_day_premonth  = bill.start_day_premonth
        if(bill.start_day == "Last"){
          bill.start_day = moment().endOf("month").date()
        }
        let start_date = moment().set({'date': bill.start_day}).startOf('day');
        if(start_day_premonth){
          start_date = start_date.subtract(1, 'months')
        }


        //End day -------------------------------------------------------
        let end_day           = bill.end_day
        let end_day_premonth  = bill.end_day_premonth
        if(bill.end_day == "Last"){
          bill.end_day = moment().endOf("month").date()
        }

        let end_date = moment().set({'date': bill.end_day}).startOf('day');
        if(end_day_premonth){
          end_date = end_date.subtract(1, 'months')
        }
      

        //console.log(bill)
        console.log('start date ' + start_date.format('YYYY-MM-DD HH:mm:ss'))
        console.log('end   date ' + end_date.format('YYYY-MM-DD HH:mm:ss'))

        let prices = await Price3Plant.find({ plant: bill.plant, 
                                        timestamp: {$gte: start_date, $lte: end_date } 
                                      })
        let plant = await Plant.findById(bill.plant)
        let customer = await Customer.findOne({plant: bill.plant})
        //console.log(plant)

        let total_kwh = 0
        let kwh_bt = 0
        let kwh_td = 0
        let kwh_cd = 0

        for (let j = 0; j < prices.length; j++) {
          const price = prices[j];
          kwh_bt += price.kwh_bt
          kwh_td += price.kwh_td
          kwh_cd += price.kwh_cd
          total_kwh += price.total_kwh
        }

        let price_bt = kwh_bt * plant.unit_price_bt
        let price_cd = kwh_cd * plant.unit_price_cd
        let price_td = kwh_td * plant.unit_price_td

        let total_price = price_bt + price_cd + price_td

        let price_after_discount = total_price * (100 - plant.discount) / 100;

        let price_after_vat = price_after_discount * (100 + plant.discount) /100;

        let index_plant = await IndexPlant.findOne({plant: bill.plant, timestamp: {$lt: moment().startOf('day') }}).sort({created_at: -1})

        let kwh_td_index, old_kwh_td_index
        let kwh_cd_index
        let kwh_bt_index
        if(index_plant){
          old_kwh_td_index = index_plant.kwh_td_index
          old_kwh_bt_index = index_plant.kwh_bt_index
          old_kwh_cd_index = index_plant.kwh_cd_index

          kwh_td_index = index_plant.kwh_td_index + kwh_td
          kwh_bt_index = index_plant.kwh_bt_index + kwh_bt
          kwh_cd_index = index_plant.kwh_cd_index + kwh_cd
        }else{
          old_kwh_td_index = 0
          old_kwh_bt_index = 0
          old_kwh_cd_index = 0

          kwh_td_index = kwh_td
          kwh_bt_index = kwh_bt
          kwh_cd_index = kwh_cd
        }


        let update = {
          billing_code: bill.code,
          name: bill.name + " "+ start_date.format("MM-YYYY"),
          start_date: start_date,
          end_date: end_date,
          total_kwh :total_kwh,
          kwh_bt : kwh_bt,
          kwh_td : kwh_td,
          kwh_cd : kwh_cd,
          unit_price_bt: plant.unit_price_bt,
          unit_price_cd: plant.unit_price_cd,
          unit_price_td: plant.unit_price_td,

          price_bt: price_bt,
          price_cd: price_cd,
          price_td: price_td,
          total_price: total_price,
          vat: plant.vat,
          discount: plant.discount,
          price_after_discount: price_after_discount,
          price_after_vat: price_after_vat,
          plant_name: plant.name,
          timestamp : moment().startOf('day'),
          timestamp_unix: moment().startOf('day').unix(),

          kwh_td_index: kwh_td_index,
          kwh_bt_index: kwh_bt_index,
          kwh_cd_index: kwh_cd_index,

          old_kwh_td_index: old_kwh_td_index,
          old_kwh_bt_index: old_kwh_bt_index,
          old_kwh_cd_index: old_kwh_cd_index,

          customer_name : customer.name,
          customer_code : customer.code,
          customer_address : customer.address,
          customer_phone : customer.phone,
          customer_email : customer.email,
          customer_tax_number : customer.tax_number,
          customer_address_use : customer.address_use,
          customer_purpose: customer.purpose,
          customer_type : customer.type,

          supplier_group: plant.supplier_group,
          supplier_name: plant.supplier_name,
          supplier_address: plant.supplier_address,
          supplier_tax_number: plant.supplier_tax_number,
          supplier_contact: plant.supplier_contact,
          
        }

        let filter2 = {
          plant: plant,
          timestamp: moment().startOf('day')
        }
        let rs2 = await IndexPlant.findOneAndUpdate(filter2, update,  {upsert: true})

        let filter = {
          plant: plant,
          billing_code: bill.code,
          timestamp: moment().startOf('day')
        }

        let rs = await Invoice.findOneAndUpdate(filter, update,  {upsert: true})
        
        console.log(update)
      }
    }
      
  }catch(error){
    console.log(error)
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

  //console.log(infors)
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
  

module.exports = {
  calc_billing
}