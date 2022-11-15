require('dotenv').config();
const status = require('../../common/status')
var moment = require('moment'); // require
const CronJob = require('cron').CronJob;
//-------------------------------------------------------------------
var mongoose = require('mongoose');
const MONGO_URL = "mongodb://iot2022:iot2022@core.ziot.vn:5003/ziot_solar"
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const Device = require('../../models/Device.model')
const DeviceRawData = require('../../models/DeviceRawData.model')

const checkStatusFunction = async () => {
    const nowTime = parseInt(moment().unix())
    const devices = await Device.find({})
    let deviceCodeArray = devices.map(device => device.code)
    const devicesData = await DeviceRawData.find({ device: { $in: deviceCodeArray } }).sort({ timestamp_unix: -1 }).sort({ device: 1 }).limit(100)
    for (let i = 0; i < deviceCodeArray.length; i++) {
        let deviceObject = devicesData.find(data => data.device === deviceCodeArray[i])
         // Check Status Inverter
        let statusDevice = (parseInt(moment().unix()) - deviceObject.timestamp_unix <= 1800) ? status.GOOD : status.OFFLINE
        let filter = {
            code: deviceCodeArray[i]
        }
        let update = {
            status: statusDevice,
            updated_at: new Date()
        }
        let updated = await Device.findOneAndUpdate(filter, update)
        console.log('UPDATE_SUCCESSFULLY')
    }
}
console.log('SERVICE-CHECK-STATUS RUNNING')
// Run job every 15 minutes
var job15minutes = new CronJob('*/15 * * * *', async function() {
    await checkStatusFunction()
  }, null, true, 'Asia/Ho_Chi_Minh');
  //================================================================
  job15minutes.start();




