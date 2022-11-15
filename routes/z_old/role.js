const express = require('express')
const User = require('../models/User')
const Station = require('../models/Station')
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const Device = require('../models/Device')
const DeviceData = require('../models/DeviceData')
const HistoryDeviceData = require('../models/HistoryDeviceData')
const HistoryStationData = require('../models/HistoryStationData')

const random = require('random')
const moment = require('moment'); // require


const router = express.Router()

router.post('/role/add', auth,async (req, res) => {
  const id  = req.body.id
  const stations  = req.body.stations

  console.log(email, newPwd)

  let pwdFixed = await bcrypt.hash(newPwd, 8)
  console.log(pwdFixed)
  //let user = User.findOne({email: email})
  //user.password = pwdFixed
  User.findOneAndUpdate({_id: id},{$push: {stations: docs[0]._id}}, function(res, err){

  });

})
    
// get all site for admin
router.get('/sa/role/site', auth, role(['SA']), async(req, res) => {
  try{
    let stations = await Station.find();
    res.send({sites: stations })
  }catch(error){
    res.send(error)
  }
})

// router.post('/users/login', async(req, res) => {
//     //Login a registered user
//     try {
//         const { email, password } = req.body
//         const user = await User.findByCredentials(email, password)
//         if (!user) {
//             return res.status(401).send({error: 'Login failed! Check authentication credentials'})
//         }
//         const token = await user.generateAuthToken()
//         res.send({ user, token })
//     } catch (error) {
//         res.status(400).send(error)
//     }
// })

// router.get('/site/list', auth, async(req, res) => {
//     let stations = await Station.find();
//     res.send(stations)
// })

// router.get('/site/list', auth, async(req, res) => {
//   try{
//     let stations = await Station.find();
//     let stationData = []
//     //let jsonStation = {}

//     for (let j = 0; j < stations.length; j++) {
//       let jsonStation = {
//         "id": stations[j]._id,
//         name: stations[j].name,
//         status: 'normal',
//         product : 0, //kWh powerGenerated
//         //power : 0,
//         workingHours : 0
//       }


//       let data = []
//       let d = {}
//       let devices = await Device.find({ station: stations[j]._id })

//       for (let i = 0; i < devices.length; i++) {
//         //console.log(devices[i])
//         d = {
//             id : devices[i]._id,
//             name : devices[i].name,
//             code: devices[i].code,
//             describe : devices[i].describe,
//             status : "normal",
//             paras: {
//               workingHours: 0,
//               powerGenerated: 0,
//               power: 0
//             }
//           }
          

//         let deviceData = await DeviceData.find({device: devices[i]._id, paras: "workingHours"}).sort({_id: -1}).limit(1)
//         if (deviceData.length > 0){
//           //console.log("Result: ", deviceData[0].value)
//           d.paras.workingHours = deviceData[0].value

//           jsonStation.workingHours += deviceData[0].value;
//         }


//         // let deviceDataPower = await DeviceData.find({device: devices[i]._id, paras: "power"}).sort({_id: -1}).limit(1)
//         // if (deviceDataPower.length > 0){
//         //   //console.log("Result: ", deviceData[0].value)
//         //   d.paras.power = deviceDataPower[0].value
//         //   jsonStation.power.value += deviceDataPower[0].value

//         // }

//         let deviceDataPowerGenerated = await DeviceData.find({device: devices[i]._id, paras: "powerGenerated"}).sort({_id: -1}).limit(1)
//         if (deviceDataPowerGenerated.length > 0){
//           d.paras.powerGenerated = deviceDataPowerGenerated[0].value
//           jsonStation.product += deviceDataPowerGenerated[0].value
//         }
        
//         data.push(d)
//         //console.log(await getCurActPower(devices[0]._id))
//       }


//       stationData.push(jsonStation)

//       //console.log(jsonStation)
//     }
//     console.log('----------->',stationData)
//     res.send({sites: stationData })
//   }catch(error){
//     res.send(error)
//   }
// })


// router.get('/site/overview', auth, async(req, res) => {
//   try{
//     let id = req.query.id;
//     //let id = req.body.id;
//     console.log(id)
//     let station = await Station.findOne({ _id: id });

//     let d = {
//       id: id,
//       curSumActPower: 0,    //power
//       todaySumEnergy: 0,
//       ratedSumPower: 0,
//       allSumEnergy: 0       //PowerGenerated
//     }
//     let devices = await Device.find({ station: id })

//     for (let i = 0; i < devices.length; i++) {
      
//       // let deviceData = await DeviceData.find({device: devices[i]._id, paras: "workingHours"}).sort({_id: -1}).limit(1)
//       // if (deviceData.length > 0){
//       //   jsonStation.workingHours += deviceData[0].value;
//       // }


//       let deviceDataPower = await DeviceData.find({device: devices[i]._id, paras: "power"}).sort({_id: -1}).limit(1)
//       if (deviceDataPower.length > 0){
//         //console.log("Result: ", deviceData[0].value)
//         d.curSumActPower = deviceDataPower[0].value
//       }

//       let deviceDataPowerGenerated = await DeviceData.find({device: devices[i]._id, paras: "powerGenerated"}).sort({_id: -1}).limit(1)
//       if (deviceDataPowerGenerated.length > 0){
//         d.allSumEnergy = deviceDataPowerGenerated[0].value
//         //jsonStation.product += deviceDataPowerGenerated[0].value
//       }
//       //console.log(await getCurActPower(devices[0]._id))
//     }

//     res.send({site: d})
//   }catch(error){
//     res.send(error)
//   }
// })

// router.get('/site/devices', auth, async(req, res) => {
//   try{
//     let id = req.query.id;
//     console.log(id)

//     let devices = await Device.find({station: id})

//     console.log( devices.length)

//     let data = []
//     let d = {}

//     for (let i = 0; i < devices.length; i++) {
//       //console.log(devices[i])
//       d = {
//           id : devices[i]._id,
//           name : devices[i].name,
//           //code: devices[i].code,
//           //describe : devices[i].describe,
//           status : "normal",
//           curActPower: 0,   //power
//           todayEnergy: 0    //kwh - powerGenerated

//           // paras: {
//           //   workingHours: 0,
//           //   powerGenerated: 0,
//           //   power: 0
//           // }
//         }
        

//       // let deviceData = await DeviceData.find({device: devices[i]._id, paras: "workingHours"}).sort({_id: -1}).limit(1)
//       // if (deviceData.length > 0){
//       //   //console.log("Result: ", deviceData[0].value)
//       //   d.paras.workingHours = deviceData[0].value
//       // }

//       let deviceDataPower = await DeviceData.find({device: devices[i]._id, paras: "power"}).sort({_id: -1}).limit(1)
//       if (deviceDataPower.length > 0){
//         //console.log("Result: ", deviceData[0].value)
//         d.curActPower = deviceDataPower[0].value
//       }

//       let deviceDataPowerGenerated = await DeviceData.find({device: devices[i]._id, paras: "powerGenerated"}).sort({_id: -1}).limit(1)
//       if (deviceDataPowerGenerated.length > 0){
//         d.todayEnergy = deviceDataPowerGenerated[0].value
//       }


      
      
//       //console.log('----------->',d)
      
//       data.push(d)
//       //console.log(await getCurActPower(devices[0]._id))
//     }
//     res.send({ devices:data})
//   }
//   catch(error){
//     res.send(error)
//   }
// })


// router.get('/site/trend', auth, async(req, res) => {
//   let id = req.query.id;
//   let dataPoint = 'power' //req.query.dataPoint; //power
//   let basedTime = req.query.basedTime; //'day'
//   let date = req.query.date //"2021-04-22"

//   console.log(req.query)

//   let devices = await Device.find({ station: id })
//   let ids = []
//   devices.forEach(function(device){
//     ids.push(device._id)
//   })

//   let deviceDataPowers;
  
//   let data = []

//   if (basedTime === 'day') {
//     let start = moment(date).startOf('day')
//     let end = moment(date).endOf('day')

//     hisStations = await HistoryStationData.find({ station: id, 
//                                                   timestamp: {$gte: start, $lte: end } 
//                                                 })

//     for (let j = 0; j < 24; j++) {
//       data[j] = 0

//       let hisStation = hisStations.filter(function(item){
//         return moment(item.timestamp).hour() == j
//       })
//       console.log(hisStation)
//       if (hisStation.length > 0) {
//         data[j] = hisStation[0].paras.power
//       }
//     }
//   }else if (basedTime === 'month') {
//     let StartMonth = moment(req.query.date).startOf('month');
//     let EndMonth = moment(req.query.date).endOf('month');
    
//     hisStations = await HistoryStationData.find({ station: id, 
//                                                   timestamp: {$gte: StartMonth, $lte: EndMonth } 
//                                                 })
//     //let StartDay = moment(req.query.date).startOf('day');     // set to 12:00 am today
//     let EndDay = moment(req.query.date).endOf('day');     // set to 12:00 am today

//     console.log(EndMonth)

//     for (let j = 1; j <= EndMonth.date(); j++) {
//       data[j] = 0
//       let hisStation = hisStations.reduce(function(total, cur){
//         return moment(cur.timestamp).date() == j ? total + cur.paras.power: total;
//       }, 0)

//       console.log(hisStation)
//       data[j] = hisStation
//     }
//     data.splice(0, 1);



//     //console.log(a)
//     //let startDate = req.query.date + " " + j  + ":00:00";
//     //let endDate = req.query.date + " " + j + ":59:59";
//     //data[0] = "Phuc is processing please wait to update. :)))"
//   }else if (basedTime === 'year') {
//     let StartYear = moment(req.query.date).startOf('year');
//     let EndYear = moment(req.query.date).endOf('year');
    
//     hisStations = await HistoryStationData.find({ station: id, 
//                                                   timestamp: {$gte: StartYear, $lte: EndYear } 
//                                                 })
//     //let StartDay = moment(req.query.date).startOf('day');     // set to 12:00 am today
//     //let EndDay = moment(req.query.date).endOf('day');     // set to 12:00 am today

//     console.log(hisStations)

//     for (let j = 0; j <= 11; j++) {
//       data[j] = 0
//       let hisStation = hisStations.reduce(function(total, cur){
//         return moment(cur.timestamp).month() == j ? total + cur.paras.power: total;
//       }, 0)

//       console.log(hisStation)
//       data[j] = hisStation
//     }
//     //data.splice(0, 1);



//     //console.log(a)
//     //let startDate = req.query.date + " " + j  + ":00:00";
//     //let endDate = req.query.date + " " + j + ":59:59";
//     //data[0] = "Phuc is processing please wait to update. :)))"
//   }
//   else{
//     //data[0] = "Phuc is processing please wait to update. :)))"
  
//   }
    
  
//   res.send({siteID: id, series: data})
  
// })


// router.get('/site/events', auth, async(req, res) => {
  
  
//   res.send({message: 'Not yet deploy'})
  
// })





module.exports = router;