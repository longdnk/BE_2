require('dotenv').config();
var moment = require('moment');
var mongoose = require('mongoose');
//---------------------------------------------------------------------
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true});

// Defind model
const DeviceRawData = require('../../models/DeviceRawData.model')
const HistoryDeviceRawData = require('../../models/HistoryDeviceRawData.model')
const DeviceRawRealtime = require('../../models/DeviceRawRealtime.model');
const RuleConfig = require('../../models/RuleConfig.model');
const UEvent = require('../../models/UEvent.model');
const Device = require('../../models/Device.model');
const Plant = require('../../models/Plant.model');
const Logger = require('../../models/Logger.model');
//---------------------------------------------------------------------
async function check_rule(){
  
    let start = moment().subtract(60, 'minutes')
    await DeviceRawRealtime.findOneAndUpdate({is_check_rule: null, timestamp: { $gte : start }, type: 'inverter'},{is_check_rule: 0} )
    let device_data = await DeviceRawRealtime.findOne({is_check_rule: 0, timestamp: { $gte : start }, type: 'inverter'})
    //if(!device_data) return
    let device = await Device.findOne({code: device_data.device})
  try{  
    let plant = await Plant.findOne({code: device_data.plant})

    console.log('Device data: ', device_data.device, device?.name)
    let rules = await RuleConfig.aggregate( [
                                  {
                                    $match: {device: mongoose.Types.ObjectId(device._id)}
                                  },
                                  {
                                    $lookup:
                                      {
                                        from: "rule_field",
                                        localField: "rule_field",
                                        foreignField: "_id",
                                        as: "fields1"
                                      }
                                  },
                                  {
                                    $unwind: "$fields"
                                  },
                                  {
                                    $lookup:
                                      {
                                        from: "rule_operator",
                                        localField: "rule_operator",
                                        foreignField: "_id",
                                        as: "operators"
                                      }
                                  },
                                  {
                                    $unwind: "$operators"
                                  },

                                ] )
    //console.log(rules_a)
    console.log(rules)

    check_rule_detail(device_data, rules, device, plant)
    let rs = await DeviceRawRealtime.findOneAndUpdate({_id: device_data._id},{is_check_rule: 1}, {})
  }catch(e){
    console.log('Error:', e);
    await Logger.create({name: 'Check rule', type: 'error', description: e.toString(), infor: [{device_data: device_data, device: device}]})
    let rs = await DeviceRawRealtime.findOneAndUpdate({_id: device_data._id},{is_check_rule: 1, note: 'Error'}, {})

  }
  
}


async function check_rule_detail(device_data, rules, device, plant){
  //let rules = await RuleConfig.find({is_active: 1}); 
 
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];

    let vl
    await device_data.paras.map(async function(p){
      if(Object.keys(p)[0].toLowerCase() == rule.fields.name.toLowerCase() ){
        vl = Object.values(p)[0]
      }
      
    })

    console.log(vl)

    function evaluate(param1, param2, operator) {
      return eval(param1 + operator + param2);
    }

    //console.log(evaluate)
    if (evaluate(vl, rule.value, rule.operators.code)) {
      //Store
      let scope
      if(rule_type = 'device'){
        scope = device.name
      }else{
        scope = plant.name
      }

      let dt = {
        name: rule.name,        
        message: rule.message,
        severity: rule.severity,
        scope: scope,
        
        beginning_time: device_data.timestamp,
        device: device_data._id,
        event_type: 'rule',     // or 'iot'
        rule_type: rule.rule_type,
        plant: device.plant,
        site: plant.site,
        //created_at: Date.now,
      }
      let rs = await UEvent.create(dt);
      console.log(dt)
      
    }



  }
}

//check()
//---------------------------------------------------------------------
let before_day;
module.exports = {
  check_rule
}
//---------------------------------------------------------------------
//check_rule()