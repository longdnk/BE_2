require('dotenv').config({ path: '../.env' });
var moment = require('moment');
var mongoose = require('mongoose');
//-------------------------------------------------------------------
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Defind model
const SampleData = require('../models/SampleData.model')
const SampleDataDay = require('../models/SampleDataDay.mode')
let timestamp =  ((new Date("2022-06-09 00:00:00").getTime()))/1000
console.log("Create Data")

// setInterval(async function () {
//   try {
//     timestamp = timestamp + 86400
//     let value = Math.floor((Math.random() * 100) + 300);
//     let created_at = new Date(timestamp*1000)
//     console.log(timestamp)
//     console.log(created_at)
//     const sample = new SampleDataDay({value, timestamp, created_at})
//     await  sample.save()
//   } catch (err) {
//     console.log(err)
//   }
// }, 3000)
let value_kwh = 195
setInterval(async function () {
  try {
    timestamp = timestamp + 900
    value_kwh = value_kwh + 5
    let value = Math.floor((Math.random() * 100) + 100);
    let created_at = new Date(timestamp*1000)
    console.log(timestamp)
    console.log(created_at)
    const sample = new SampleData({value, value_kwh , timestamp, created_at})
    await  sample.save()
  } catch (err) {
    console.log(err)
  }
}, 2000)



