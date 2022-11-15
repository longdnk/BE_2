var moment = require('moment');
//const { calc_kwh_diff } = require('./calc_kwh_diff.js');
const CronJob = require('cron').CronJob;


var calc_del = require('./calc_del.js')
var calc_sensor_date = require('./calc_sensor_date.js')
var calc_price_3 = require('./calc_price_3.js')
var calc_billing = require('./calc_billing');
const rule = require('./rule.js');
//================================================================
// Run job every 1h00 am everyday

var job1hour_am = new CronJob('30 0 * * *', async function() {
  await calc_del.delete_realtime()    

  //console.log('------->',moment().format('H mm ss') )

}, null, true, 'Asia/Ho_Chi_Minh');


var job1hour30_am = new CronJob('30 1 * * *', async function() {
  await calc_billing.calc_billing()    

  //console.log('------->',moment().format('H mm ss') )

}, null, true, 'Asia/Ho_Chi_Minh');


//================================================================
// Run job every 20 minutes
var job20minutes = new CronJob('*/10 * * * *', async function() {
  //await calc_del.delete_realtime()    

  await calc_sensor_date.StoredSensorDate(moment())
  await calc_price_3.calc_price_3_plant(moment())
  
}, null, true, 'Asia/Ho_Chi_Minh');

//================================================================
// Run job every 10s
var job10s = new CronJob('*/10 * * * * *', async function() {
  //await calc_del.delete_realtime()    

  //await rule.check_rule()
  
}, null, true, 'Asia/Ho_Chi_Minh');
//================================================================


job1hour_am.start();
job20minutes.start();
job10s.start();

calc_price_3.calc_price_3_plant(moment())