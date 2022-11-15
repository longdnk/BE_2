const express = require('express')
const auth = require('../../middlewares/auth')

// const Device = require('../models/Device')
// const DeviceData = require('../models/DeviceData')
// const HistoryDeviceData = require('../models/HistoryDeviceData')

var controller = require('../../controllers/admin/station.controller');
const { send } = require('express/lib/response')

const router = express.Router()

router.get('/list', auth, controller.getList);

router.post('/add', controller.postAdd);


router.get('/station', () => {
    console.log('hello')
    req.send('Hello')
});



// router.get('/stations', async(req, res) => {
//   let stations = await Station.find();
//   let stationData = []

//   for (let j = 0; j < stations.length; j++) {
//     let jsonStation = {
//       "_id": stations[j]._id,
//       "name": stations[j].name,
//       "describe": stations[j].describe,
      
//       status: 'normal',
//       todayYield : {
//         value : 0,
//         unit: "kWh",
//         note: "Sum of daily yield (powerGenerated)"
//       },

//       power : {
//         value : 0,
//         unit: "kW",
//         note: "Sum of totalPower"
//       },

//       workingHours : {
//         value: 0,
//         unit: "h",
//         note: "Sum of workingHours"
//       },
//     }


//     let data = []
//     let d = {}
//     let devices = await Device.find({ station: stations[j]._id })

//     for (let i = 0; i < devices.length; i++) {
//       //console.log(devices[i])
//       d = {
//           _id : devices[i]._id,
//           name : devices[i].name,
//           code: devices[i].code,
//           describe : devices[i].describe,
//           status : "normal",
//           paras: {
//             workingHours: 0,
//             powerGenerated: 0,
//             power: 0
//           }
//         }
        

//       let deviceData = await DeviceData.find({device: devices[i]._id, paras: "workingHours"}).sort({_id: -1}).limit(1)
//       if (deviceData.length > 0){
//         //console.log("Result: ", deviceData[0].value)
//         d.paras.workingHours = deviceData[0].value

//         jsonStation.workingHours.value += deviceData[0].value;
//       }


//       let deviceDataPower = await DeviceData.find({device: devices[i]._id, paras: "power"}).sort({_id: -1}).limit(1)
//       if (deviceDataPower.length > 0){
//         //console.log("Result: ", deviceData[0].value)
//         d.paras.power = deviceDataPower[0].value
//         jsonStation.power.value += deviceDataPower[0].value

//       }

//       let deviceDataPowerGenerated = await DeviceData.find({device: devices[i]._id, paras: "powerGenerated"}).sort({_id: -1}).limit(1)
//       if (deviceDataPowerGenerated.length > 0){
//         d.paras.powerGenerated = deviceDataPowerGenerated[0].value
//         jsonStation.todayYield.value += deviceDataPowerGenerated[0].value
//       }
      
//       data.push(d)
//       //console.log(await getCurActPower(devices[0]._id))
//     }


//     stationData.push(jsonStation)

//     //console.log(jsonStation)
//   }
//   console.log('----------->',stationData)
//   res.send(stationData)
// })



// router.get('/station/show/:id', auth, async(req, res) => {
//     let id = req.params.id;
//     //let id = req.body.id;
//     console.log(id)
//     let station = await Station.findOne({ _id: id });
//     res.send(station)
// })

// router.post('/station/trend/day', auth, async(req, res) => {
//   let station_id = req.body.station_id;
//   let dataPoint = req.body.dataPoint; //power
//   let basedTime = req.body.basedTime; //'day'
//   let strDate = req.body.date //"2021-04-22"

//   console.log(req.body)

//   let devices = await Device.find({ station: station_id })
//   let ids = []
//   devices.forEach(function(device){
//     ids.push(device._id)
//   })


//   let infor = {
//     station_id: req.body.station_id,
//     dataPoint : req.body.dataPoint,
//     basedTime : req.body.basedTime,
//     strDate : req.body.date
//   }
//   let data = []

//   for (let j = 0; j <= 23; j++) {
//     let startDate = req.body.date + " " + j  + ":00:00";
//     let endDate = req.body.date + " " + j + ":59:59";
    
//     let deviceDataPowers;

//     let sum = 0
//     let count = 0
//     let avg = 0

//     //for (let i = 0; i < devices.length; i++) {
      
//       deviceDataPowers = await HistoryDeviceData.find({ device: { $in: ids }, 
//                                                         paras: dataPoint, 
//                                                         timestamp: {$gte: startDate, $lte: endDate } 
//                                                       })

//       //console.log(devices[i]._id," --> ", deviceDataPowers.length)

//       if(deviceDataPowers.length > 0){
//         //console.log(deviceDataPowers[0].value)

//         for(let k = 0; k < deviceDataPowers.length; k++) {
//           sum += deviceDataPowers[k].value
//           count += 1

//         }
//       }

//       if (count > 0) {
//         avg = sum/count
//       }else{
//         avg = 0
//       }



//       let d = {
//         hour: j,
//         value: avg
//       }
      
//       data.push(d)
  
//     //avg = sum/count;
//     console.log('sum = ', sum, ' count = ', count, ' avg = ', avg)
    
//     console.log(j,' -----------> ', startDate)
    
//   }

//   // let stationData = []
//   // //let jsonStation = {}

//   // // for (let j = 0; j < stations.length; j++) {
//   // //   let jsonStation = {
//   // //     "_id": stations[j]._id,
//   // //     "name": stations[j].name,
//   // //     "describe": stations[j].describe,
      
//   // //     status: 'normal',
//   // //     todayYield : {
//   // //       value : 0,
//   // //       unit: "kWh",
//   // //       note: "Sum of daily yield (powerGenerated)"
//   // //     },

//   // //     power : {
//   // //       value : 0,
//   // //       unit: "kW",
//   // //       note: "Sum of totalPower"
//   // //     },

//   // //     workingHours : {
//   // //       value: 0,
//   // //       unit: "h",
//   // //       note: "Sum of workingHours"
//   // //     },
//   // //   }


//   // //   let data = []
//   // //   let d = {}
//   // //   let devices = await Device.find({ station: stations[j]._id })

//   // //   for (let i = 0; i < devices.length; i++) {
//   // //     //console.log(devices[i])
//   // //     d = {
//   // //         _id : devices[i]._id,
//   // //         name : devices[i].name,
//   // //         code: devices[i].code,
//   // //         describe : devices[i].describe,
//   // //         status : "normal",
//   // //         paras: {
//   // //           workingHours: 0,
//   // //           powerGenerated: 0,
//   // //           power: 0
//   // //         }
//   // //       }
        

//   // //     let deviceData = await DeviceData.find({device: devices[i]._id, paras: "workingHours"}).sort({_id: -1}).limit(1)
//   // //     if (deviceData.length > 0){
//   // //       //console.log("Result: ", deviceData[0].value)
//   // //       d.paras.workingHours = deviceData[0].value

//   // //       jsonStation.workingHours.value += deviceData[0].value;
//   // //     }


//   // //     let deviceDataPower = await DeviceData.find({device: devices[i]._id, paras: "power"}).sort({_id: -1}).limit(1)
//   // //     if (deviceDataPower.length > 0){
//   // //       //console.log("Result: ", deviceData[0].value)
//   // //       d.paras.power = deviceDataPower[0].value
//   // //       jsonStation.power.value += deviceDataPower[0].value

//   // //     }

//   // //     let deviceDataPowerGenerated = await DeviceData.find({device: devices[i]._id, paras: "powerGenerated"}).sort({_id: -1}).limit(1)
//   // //     if (deviceDataPowerGenerated.length > 0){
//   // //       d.paras.powerGenerated = deviceDataPowerGenerated[0].value
//   // //       jsonStation.todayYield.value += deviceDataPowerGenerated[0].value
//   // //     }
      
//   // //     data.push(d)
//   // //     //console.log(await getCurActPower(devices[0]._id))
//   // //   }


//   // //   stationData.push(jsonStation)

//   // //   //console.log(jsonStation)
//   // // }
//   // console.log('----------->',stationData)
//   res.send({result: 1, infor, data})
// })

// router.post('/station/trend/month', auth, async(req, res) => {
//   let station_id = req.body.station_id;
//   let dataPoint = req.body.dataPoint; //power
//   let basedTime = req.body.basedTime; //'day'
//   let strDate = req.body.date //"2021-04-22"

//   console.log(req.body)

//   let infor = {
//     station_id: req.body.station_id,
//     dataPoint : req.body.dataPoint,
//     basedTime : req.body.basedTime,
//     strDate : req.body.date
//   }

//   if(false){


//   let devices = await Device.find({ station: station_id })
//   let ids = []
//   devices.forEach(function(device){
//     ids.push(device._id)
//   })


  
//   //let data = []

//   for (let j = 0; j <= 23; j++) {
//     let startDate = req.body.date + " " + j  + ":00:00";
//     let endDate = req.body.date + " " + j + ":59:59";
    
//     let deviceDataPowers;

//     let sum = 0
//     let count = 0
//     let avg = 0

//     //for (let i = 0; i < devices.length; i++) {
      
//       deviceDataPowers = await HistoryDeviceData.find({ device: { $in: ids }, 
//                                                         paras: dataPoint, 
//                                                         timestamp: {$gte: startDate, $lte: endDate } 
//                                                       })

//       //console.log(devices[i]._id," --> ", deviceDataPowers.length)

//       if(deviceDataPowers.length > 0){
//         //console.log(deviceDataPowers[0].value)

//         for(let k = 0; k < deviceDataPowers.length; k++) {
//           sum += deviceDataPowers[k].value
//           count += 1

//         }
//       }

//       if (count > 0) {
//         avg = sum/count
//       }else{
//         avg = 0
//       }



//       let d = {
//         hour: j,
//         value: avg
//       }
      
//       data.push(d)
  
//     //avg = sum/count;
//     console.log('sum = ', sum, ' count = ', count, ' avg = ', avg)
    
//     console.log(j,' -----------> ', startDate)
    
//   }

//   }
  
//   let data = []
//   for (let j = 1; j <= 30; j++) {
//     let d = {
//       day: j,
//       value: random.int(1000, 9000),
//       unit: "W"
//     }
//     data.push(d)
//   }

//   res.send({result: 1, infor, data})
// })

// router.post('/station/trend/year', auth, async(req, res) => {
//   let station_id = req.body.station_id;
//   let dataPoint = req.body.dataPoint; //power
//   let basedTime = req.body.basedTime; //'day'
//   let date = req.body.date //"2021-04-22"

//   console.log(req.body)

//   let infor = {
//     station_id: req.body.station_id,
//     dataPoint : req.body.dataPoint,
//     basedTime : req.body.basedTime,
//     date : req.body.date
//   }

//   if(false){


//   let devices = await Device.find({ station: station_id })
//   let ids = []
//   devices.forEach(function(device){
//     ids.push(device._id)
//   })


  
//   //let data = []

//   for (let j = 0; j <= 23; j++) {
//     let startDate = req.body.date + " " + j  + ":00:00";
//     let endDate = req.body.date + " " + j + ":59:59";
    
//     let deviceDataPowers;

//     let sum = 0
//     let count = 0
//     let avg = 0

//     //for (let i = 0; i < devices.length; i++) {
      
//       deviceDataPowers = await HistoryDeviceData.find({ device: { $in: ids }, 
//                                                         paras: dataPoint, 
//                                                         timestamp: {$gte: startDate, $lte: endDate } 
//                                                       })

//       //console.log(devices[i]._id," --> ", deviceDataPowers.length)

//       if(deviceDataPowers.length > 0){
//         //console.log(deviceDataPowers[0].value)

//         for(let k = 0; k < deviceDataPowers.length; k++) {
//           sum += deviceDataPowers[k].value
//           count += 1

//         }
//       }

//       if (count > 0) {
//         avg = sum/count
//       }else{
//         avg = 0
//       }



//       let d = {
//         hour: j,
//         value: avg
//       }
      
//       data.push(d)
  
//     //avg = sum/count;
//     console.log('sum = ', sum, ' count = ', count, ' avg = ', avg)
    
//     console.log(j,' -----------> ', startDate)
    
//   }

//   }
  
//   let data = []
//   for (let j = 2021; j <= 2025; j++) {
//     let d = {
//       year: j,
//       value: random.int(10000, 90000),
//       unit: "W"
//     }
//     data.push(d)
//   }

//   res.send({result: 1, infor, data})
// })

// router.post('/station/event', auth, async(req, res) => {
//   let station_id = req.body.station_id;
//   let d1 = {
//     caption: 'Inverter bị lỗi',
//     type:'Error',
//     status:'Active',
//     timestamp:new Date(),
//     updated_at: new Date(),
//     device: '607c7e4cba23121608c8fc77'
//   }

//   let d2 = {
//     caption: 'Inverter cảnh báo',
//     type:'Warning',
//     status:'Active',
//     timestamp:new Date(),
//     updated_at: new Date(),
//     device: '607c7e4cba23121608c8fc77'
//   }
//   let data = [d1, d2]
  


//   res.send({result: 1, data})
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


module.exports = router;