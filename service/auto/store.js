require('dotenv').config();
var moment = require('moment');
var mongoose = require('mongoose');

var bodyParser = require('body-parser')
const express = require('express')
//-------------------------------------------------------------------
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true});


// Defind model
const DeviceRawData = require('../../models/DeviceRawData.model')
const HistoryDeviceRawData = require('../../models/HistoryDeviceRawData.model')
const DeviceRawRealtime = require('../../models/DeviceRawRealtime.model')
//---------------------------------------------------------------
// Mqtt
const mqtt = require('mqtt');
var options = {
    port: process.env.MQTT_PORT,
    username: 'iot2022',
    password: 'iot2022',
    protocolVersion: 5,
};

//===============================================================
// Socket IO
const { io } = require("socket.io-client");
const socket = io("http://backend.ziot.vn:" + process.env.SOCKET_PORT);
//const socket = io("http://127.0.0.1:" + 3000);

socket.on("connect", () => {
  console.log('Socket IO connected ' + socket.id);
  
});

socket.on("disconnect", () => {
  //console.log(socket.id); // undefined
});


//===============================================================

const Queue = require('../../common/Queue')
let _queue = new Queue();
let _queue_station = new Queue();

const client = mqtt.connect(process.env.MQTT_URL, options );
let data;

client.on("connect", ack => {
  console.log("MQTT Client Connected!");
  client.subscribe('DEVICE/#'); // Solar/id/PARAR
  //client.subscribe('STATION/#'); // Solar/id/PARAR

  client.on("message", async (topic, message) => {
    //console.log(`MQTT Client Message.  Topic: ${topic}.  Message: ${message.toString()}`);
    try{
      const str_topic = topic.split('/');
      if(str_topic[0] == "DEVICE" && str_topic[6] == "reportData"){
        //console.log(message.toString())
        data = JSON.parse(message.toString())
                
        data.timestamp = moment(data.timeStamp).add(7, 'hours')   
        data.timestamp_unix = moment(data.timeStamp).add(7, 'hours').unix()
     
        data.updated_at = new Date()
        data.paras =  data.data
        data.type =  data.type
        data.domain = str_topic[1]
        data.portfolio =  str_topic[2]
        data.site = str_topic[3] 
        data.plant = str_topic[4] 
        data.device = str_topic[5] 
        data.topic = 'DEVICE'

        _queue.enqueue(data);
        socket.emit("iot-update", {plant_code: str_topic[4]});
      }
    }catch(error){
      console.log('error', error.message)
    }
  });
});

setInterval(async function(){
  console.log(_queue.getSize())
  try{
    if(_queue.getSize() > 0){
      let data =  _queue.dequeue()

      await DeviceRawData.insertMany(data)
      //await HistoryDeviceRawData.insertMany(data)
      await DeviceRawRealtime.insertMany(data)
    }
  } catch(e) {
    console.log(e)
  }
}, 5000)


client.on("error", err => {
  console.log(err);
});






