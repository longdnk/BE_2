const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const Device = require('../models/Device')
const auth = require('../middlewares/auth')
const DeviceData = require('../models/DeviceData')
const moment = require('moment'); // require
const HistoryDeviceData = require('../models/HistoryDeviceData')
const IotDevice = require('../models/IotDevice')

const err = require('../common/err')

const router = express.Router()

router.post('/iot_device', auth, async (req, res) => {
  if (!req.body.name) {
    res.json(err.E40201)
    return
  }
  try {
    req.body.updated_at = new Date()
    req.body.created_at = new Date()
    const iot_device = new IotDevice(req.body)
    //console.log(iot_device)
    await iot_device.save()

      // let doc = await Station.findOneAndUpdate({_id:req.body.station}, {$push: {devices: device._id}},{'upsert':true})
      // console.log(doc)
      res.status(201).send({iot_device: iot_device })
  } catch (error) {
    if (error.code == 11000) {
      res.json(err.E40200)
      return 
    }
    res.status(500).send({"error": error.message})
  }
})

router.get('/iot_device', auth, async(req, res) => {
  try{
    let site_id = req.query.site_id ? req.query.site_id : null;
    let query = {}
    if (site_id) {
      query = {station: site_id}
    }
    //console.log(query)

    let iot_devices = await IotDevice.find(query)
                                     .populate({ path: 'station', select: 'name' })

                              //console.log(iot_devices)
    let result = iot_devices.map((item) => {
      return { 
        id: item.id, 
        name: item.name, 
        code: item.code, 
        site_id: item.station ? item.station._id : "", 
        site_name: item.station ? item.station.name : "" ,
        dhcp_enable : item.dhcp_enable,
        ip_address : item.ip_address,
        subnet_mask : item.subnet_mask,
        default_gateway : item.default_gateway,
        dns : item.dns,
    
      }
    })
     
    res.status(201).send({iot_devices: result})
  }catch (error) {
    res.status(400).send({error: error.message})
  } 
})


router.post('/iot_device_assign', auth, async (req, res) => {
  if (!req.body.code) {
    res.json(err.E40202)
    return
  }

  if (!req.body.site_id) {
    res.json(err.E40203)
    return
  }

  try {
    let iot_device = await IotDevice.findOne({code: req.body.code})
    if (!iot_device) {
      res.json(err.E40204)
      return
    }
    iot_device.station = req.body.site_id
    await iot_device.save()

    let d = {
      id: iot_device._id,
      name: iot_device.name,
      code: iot_device.code,
      site_id: iot_device.station,
      status : iot_device.status ? 'online' : 'offline'
    }

    res.status(201).send({iot_device: d })
  } catch (error) {
    // if (error.code == 11000) {
    //   res.json(err.E40200)
    //   return 
    // }
    res.status(500).send({"error": error.message})
  }
})
// router.get('/devices', auth, async(req, res) => {
//     //let id = req.params.station_id;
//     //try{
//         let station_id = req.body.station_id
//         console.log(station_id)
//         //let station = await Station.findOne({_id: station_id});
//         let devices = await Device.find({station: station_id})

//         console.log( devices.length)

//         let data = []
//         let d = {}

//         for (let i = 0; i < devices.length; i++) {
//           //console.log(devices[i])
//           d = {
//               _id : devices[i]._id,
//               name : devices[i].name,
//               code: devices[i].code,
//               describe : devices[i].describe,
//               status : "normal",
//               paras: {
//                 workingHours: 0,
//                 powerGenerated: 0,
//                 power: 0
//               }
//             }
            

//           let deviceData = await DeviceData.find({device: devices[i]._id, paras: "workingHours"}).sort({_id: -1}).limit(1)
//           if (deviceData.length > 0){
//             //console.log("Result: ", deviceData[0].value)
//             d.paras.workingHours = deviceData[0].value
//           }

//           let deviceDataPower = await DeviceData.find({device: devices[i]._id, paras: "power"}).sort({_id: -1}).limit(1)
//           if (deviceDataPower.length > 0){
//             //console.log("Result: ", deviceData[0].value)
//             d.paras.power = deviceDataPower[0].value
//           }

//           let deviceDataPowerGenerated = await DeviceData.find({device: devices[i]._id, paras: "powerGenerated"}).sort({_id: -1}).limit(1)
//           if (deviceDataPowerGenerated.length > 0){
//             d.paras.powerGenerated = deviceDataPowerGenerated[0].value
//           }


          
          
//           console.log('----------->',d)
          
//           data.push(d)
//           //console.log(await getCurActPower(devices[0]._id))
//         }

//         //console.log(data)
//         res.send({result: 1, data})

//         //“desc”: <device_description>,
//     // “status”: <device_status>,
//     // “curActPower”: <power_value>,
//     // “todayEnergy”: <energy_value>},



//     //     res.status(201).send({result: 1, data: devices })
//     // }
//     // catch (error) {
//     //     res.status(400).send({result: 0,error})
//     // }
    

    

//     //res.send(station.devices)
// })


// router.get('/station/show/:id', auth, async(req, res) => {
//     let id = req.params.id;
//     //let id = req.body.id;
//     console.log(id)
//     let station = await Station.findOne({ _id: id });
//     res.send(station)
// })

// router.post('/station/edit/:id', auth, async(req, res) => {
//     let id = req.params.id; //req.params.id
//     //let data = req.body;
//     //console.log("id = ",id)
//     //let station = await Station.findOne({ _id: id });
//     //res.send(station)

//     var query = {"_id": req.params.id};
//     var data = {
//         "name" : req.body.name,
//         "describe" : req.body.describe,
//     }
//     //console.log(query)
//     Station.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
//         if (err) return res.send(500, { error: err });
//         res.status(200).send('Success');
//     });

// })

// //get details id
// router.get('/site/device/details', auth, async(req, res) => {
//   try{
//     let id = req.query.id; //site_id
//     //console.log(id)
//       //let station = await Station.findOne({_id: station_id});
//     let device = await Device.findOne({_id: id})
//     if (device) {
//       let d = {
//             id : device.id,
//             name : device.name,
//             IP : device.IP,
//             manufacturer : device.manufacturer,
//             minResponseTimeInMiliSecond : device.minResponseTimeInMiliSecond,
//             model : device.model,
//             port : device.port,
//             code: device.code,
//             status : "normal",
//             paras: device.paras
//           }

//       let data = []
//       //let d = {}

//       let deviceData = await DeviceData.find({device: id}).sort({_id: -1}).limit(1)
//       if (deviceData.length > 0) {
//         let paras = deviceData[0].paras;
//         //console.log(d.paras)

//         for (let i = 0; i < d.paras.length; i++) {
//           for (var j = 0; j < paras.length; j++) {
//             //console.log(paras[j].name)
//             if(paras[j].name == d.paras[i].name){
//               //console.log("-->",paras[j].value, d.paras[i])
//               d.paras[i].value = paras[j].value
//             }
//           }
//         }
//         res.send({device: d})
//       }else{
//         res.status(400).send(err.E40012)
//       }
//     }else{
//       res.status(400).send(err.E40013)
//     }
//   }
//   catch (error) {
//       res.status(400).send({code: 40001, message: error.message})
//   }
    

    

//     //res.send(station.devices)
// })

// router.get('/device/trend', auth, async(req, res) => {
//   try{
//     let id = req.query.id;  //device_id
//     let dataPoint = 'power' //req.query.dataPoint; //power
//     let basedTime = req.query.basedTime; //'day'
//     let date = req.query.date //"2021-04-22"
//     let type = req.query.type //"power / energy"


//     let deviceDataPowers;
//     let data = []

//     let sum = 0
//     let count = 0
//     let avg = 0

//     if (basedTime === 'day' && type === 'power') {
//       let start = moment(date).startOf('day')
//       let end = moment(date).endOf('day')

//       hisStations = await HistoryDeviceData.find({ device: id, 
//                                                    timestamp: {$gte: start, $lte: end } 
//                                                 })
      
//       for (let j = 0; j < 288; j++) {
//         sum = 0, count = 0, avg = 0
//         let start1 = moment(start).startOf('minute')
//         let end1 = moment(start).add(5, 'minutes').startOf('minute')
//         //console.log(start1, end1)
//         let a1 = hisStations.map(x => {
//           if (x.timestamp <= end1 && x.timestamp >= start1) {
//             sum +=  x.paras.Watts
//             count++

//             if (count > 0) {
//               avg = sum/count
//             }else{
//               avg = 0
//             }
//           }
//           return avg
//         })
//         data.push(avg)
//         start = end1
//       }

//       // for (let j = 0; j < 24; j++) {
//       //   data[j] = 0

//       //   let hisStation = hisStations.filter(function(item){
//       //     return moment(item.timestamp).hour() == j
//       //   })
//       //   //console.log(hisStation)
//       //   if (hisStation.length > 0) {
//       //     data[j] = hisStation[0].paras.power
//       //   }
//       // }

//     }else if (basedTime === 'month' && type === 'energy') {
//       let StartMonth = moment(req.query.date).startOf('month');
//       let EndMonth = moment(req.query.date).endOf('month');
      
//       hisStations = await HistoryDeviceData.find({ device: id, 
//                                                     timestamp: {$gte: StartMonth, $lte: EndMonth } 
//                                                   })
//       //let StartDay = moment(req.query.date).startOf('day');     // set to 12:00 am today
//       let EndDay = moment(req.query.date).endOf('day');     // set to 12:00 am today

//       //console.log(EndMonth)

//       for (let j = 1; j <= EndMonth.date(); j++) {
//         data[j] = 0
//         let hisStation = hisStations.reduce(function(total, cur, _, { length }){
//           return moment(cur.timestamp).date() == j ? total + cur.paras.WH/length: total;
//         }, 0)

//         //console.log(hisStation)
//         data[j] = hisStation
//       }
//       data.splice(0, 1);



//       //console.log(a)
//       //let startDate = req.query.date + " " + j  + ":00:00";
//       //let endDate = req.query.date + " " + j + ":59:59";
//       //data[0] = "Phuc is processing please wait to update. :)))"
//     }else if (basedTime === 'year' && type === 'energy') {
//       let StartYear = moment(req.query.date).startOf('year');
//       let EndYear = moment(req.query.date).endOf('year');
      
//       hisStations = await HistoryDeviceData.find({ device: id, 
//                                                     timestamp: {$gte: StartYear, $lte: EndYear } 
//                                                   })

//       for (let j = 0; j <= 11; j++) {
//         data[j] = 0
//         let hisStation = hisStations.reduce(function(total, cur, _, { length }){
//           return moment(cur.timestamp).month() == j ? total + cur.paras.WH/length : total;
//         }, 0)
//         data[j] = hisStation
//       }
//       //console.log(a)
//       //let startDate = req.query.date + " " + j  + ":00:00";
//       //let endDate = req.query.date + " " + j + ":59:59";
//       //data[0] = "Phuc is processing please wait to update. :)))"
//     }
//     else{
//       res.json(err.E40010)
//       return
//     }

//     res.send({siteID: id, type: type,series: data})
//   }catch(error){
//     res.send(err.E40001, error.message)
//   }
// })




module.exports = router;