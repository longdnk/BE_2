const Site = require('../../models/Site.model');
const Plant = require('../../models/Plant.model');
const Iot = require('../../models/Iot.model');
const IotPlant = require('../../models/IotPlant.model');
const Device = require('../../models/Device.model');
const Customer = require('../../models/Customer.model');
const Supplier = require('../../models/Supplier.model');
const BillingConfig = require('../../models/BillingConfig.model');
const BillingSchedule = require('../../models/BillingSchedule.model');
const Budget = require('../../models/Budget.model');
const {catchErrors} = require('../../helpers/errorCatching');
const {getCodeOfNextElement} = require('../../helpers/commonHelpers');
const httpResponseCode = require('../../common/httpResponseCode');
const moment = require('moment');


/**PLC00002
 * Get detailed infor of plant
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed data of Plant
 */
module.exports.getPlantDetails = async(req,res) => {
    try{
        const plantId = req.params.id;
        let plantInfor = await Plant.findById(plantId).select('-__v -created_at -updated_at -users -iot');
        if(!plantInfor) {
            throw new Error('E42007');
        };
        let siteInfor = await Site.findById(plantInfor.site).select('name code');
        let deviceInfors = await Device.find({_id:{$in:plantInfor.devices}}).select('name code type');
        let customer = await Customer.findById(plantInfor.customer).select('name');
        let supplier = await Supplier.findById(plantInfor.supplier).select('name')
        let iotInPlant = await IotPlant.find({plant: plantInfor._id}).select('iot_code infor devices');
        iotInPlant = JSON.parse(JSON.stringify(iotInPlant))
        //Get detail for devices and iot
        for(let i=0; i<iotInPlant.length; i++){
            iotInPlant[i] = {
                _id: iotInPlant[i]._id,
                iotCode: iotInPlant[i].iot_code,
                name: iotInPlant[i].name,
                infor: iotInPlant[i].infor,
                devices: await Device.find({_id: {$in: iotInPlant[i].devices}}).select('name'),
                name: (await Iot.findOne({code:iotInPlant[i].iot_code}).select('name')).name,
            }
        }
        plantInfor = JSON.parse(JSON.stringify(plantInfor));
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: plantInfor._id,
                name: plantInfor.name,
                code: plantInfor.code,
                site:siteInfor,
                devices: deviceInfors,
                lat: plantInfor.lat,
                lng: plantInfor.lng,
                capacity: plantInfor.capacity,
                pArray:plantInfor.pArray,
                address: plantInfor.address,
                isActive: plantInfor.is_active,
                description: plantInfor.description,
                inverter: plantInfor.inverter,
                modules: plantInfor.modules,
                southOrientation: plantInfor.southOrientation,
                tilt: plantInfor.tilt,
                customer: customer? customer : {},
                supplier: supplier? supplier : {},
                iotInPlant: iotInPlant,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PLC00003
 * Get condition before create new plant
 * @param {*} req 
 * @param {*} res 
 * @returns Object of nextCode and available sites, devices and iots
 */
module.exports.getPlantCondition = async(req,res) => {
    try{
        let lastPlant = await Plant.find().limit(1).sort({$natural:-1}).select('code');
        let iots = await Iot.find().select('name code')
        let code = 'PL00000'
        if(lastPlant.length){
            code = getCodeOfNextElement(lastPlant[0].code)
        }
        let siteList = await Site.find().select('name code');
        let availableDevices = await Device.find({plant: {$eq:null}}).select('name code');
        let currentMonth = moment().format('YYYY-MM');
        let monthCountForUpdateBudget = 12;
        let next12Months = [];
        //Get next 12 months after this month to update Budget when create new Plant
        for(let i=0; i<monthCountForUpdateBudget; i++){
            next12Months.push(moment(currentMonth, 'YYYY-MM').add(i, 'months').format('YYYY-MM'));
        }
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                nextCode: code,
                sites: siteList,
                availableDevices: availableDevices,
                iots: iots,
                next12Months: next12Months
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PLC00004
 * Create new Plant
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of new Plant
 */
module.exports.postAddPlant = async(req,res) => {
    try{
        const newPlantBasicData = {
            name: req.body.name,	
            code: req.body.code,
            site: req.body.site,
            devices: req.body.devices,
            lat: req.body.lat,  
            lng: req.body.lng,
            address: req.body.address,
            is_active: req.body.isActive,
            description: req.body.description,
            inverter: req.body.inverter,
            modules: req.body.modules,
            southOrientation: req.body.southOrientation,
            tilt: req.body.tilt,
            customer: req.body.customer,
            supplier: req.body.supplier,
            capacity: 0,
            pArray: 0,
        }
        let billingConfig = req.body.billingConfig;
        let billingSchedules = req.body.billingSchedules;
        let monthlyBudgets = req.body.monthlyBudgets;
        let isSiteExist = await Site.findById(newPlantBasicData.site);
        let deviceList = await Device.find({_id:{$in:newPlantBasicData.devices}});
        if (!isSiteExist || deviceList.length !== newPlantBasicData.devices.length) {
            throw new Error('E42007');
        };
        let isDeviceAssignedYet = deviceList.every(device => device.plant === null);
        if (!isDeviceAssignedYet) {
            throw new Error('E42008');
        };
        let customer = {};
        if(newPlantBasicData.customer && newPlantBasicData.customer.length){
            customer = await Customer.findById(newPlantBasicData.customer).select('name');
            if(!customer ){
                throw new Error('E42023')
            }
        }
        let supplier = {};
        if(newPlantBasicData.supplier && newPlantBasicData.supplier.length){
            supplier = await Supplier.findById(newPlantBasicData.supplier).select('name');
            if(!supplier ){
                throw new Error('E42023')
            }
        }
        let newPlant = new Plant(newPlantBasicData);
        await newPlant.save();
        await Device.updateMany({_id:{$in:newPlantBasicData.devices}},{$set:{plant:newPlant._id}});
        await Site.updateOne({_id:newPlantBasicData.site}, {$push: {plants: newPlant._id}});
        let billingConfigDb = {
                plant: newPlant._id,
                plant_name: newPlant.name,
                price_30: billingConfig.peakLoadTariff,
                price_20: billingConfig.normalLoadTariff,
                price_10: billingConfig.lowLoadTariff,
                vat: billingConfig.vat,
                discount: billingConfig.discount,
                infor: billingConfig.infor,
        }
        let billingSchedulesDb = billingSchedules.map(schedule =>{
            return {
                plant: newPlant._id,
                plant_name: newPlant.name,
                name: schedule.name,
                code: schedule.code,
                is_active: schedule.isActive,
                start_day: schedule.startDay,
                start_day_premonth: schedule.startDayPremonth,
                end_day: schedule.endDay,
                end_day_premonth: schedule.endDayPremonth,
                run_day: schedule.runDay,
            }
        })
        let monthlyBudgetsDb =await monthlyBudgets.map(budget =>{
            return{
                plant: newPlant._id,
                plant_name: newPlant.name,
                month: budget.month,
                timestamp_unix: moment(budget.month,'YYYY-MM').format('X'),
                budget_production: budget.budgetProduction,
                budget_performance_ratio: budget.budgetPerformanceRatio,
                budget_specific_yield: budget.budgetSpecificYield,
            }
        })
        await BillingConfig.insertMany(billingConfigDb);    
        await BillingSchedule.insertMany(billingSchedulesDb);
        await Budget.insertMany(monthlyBudgetsDb);

        return res.status(httpResponseCode.created).send({
            code:httpResponseCode.created, 
            message:'OK', 
            data:{
                _id: newPlant._id,
                name: newPlant.name,
                code: newPlant.code,
                site: newPlant.site,
                devices: newPlant.devices,
                lat: newPlant.lat,
                lng: newPlant.lng,
                capacity: 0,
                pArray:0,
                address: newPlant.address,
                isActive: newPlant.is_active,
                description: newPlant.description,
                inverter: newPlant.inverter,
                modules: newPlant.modules,
                southOrientation: newPlant.southOrientation,
                tilt: newPlant.tilt,
                customer: newPlant.customer,
                supplier: newPlant.supplier,
                billingConfig: billingConfig,
                billingSchedules: billingSchedules,
                monthlyBudgets: monthlyBudgets,
            }
        })
    } catch(error) {
        console.log(error)
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PLC00005
 * Update basic Infor for Plant
 * @param {name lat lng address} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated Plant
 */
module.exports.postUpdateBasic = async(req,res) => {
    try{
        let plantId = req.params.id;
        let data = {
            name: req.body.name,	
            lat: req.body.lat,  
            lng: req.body.lng,
            address: req.body.address,
            is_active: req.body.isActive,
            description: req.body.description,
            inverter: req.body.inverter,
            modules: req.body.modules,
            southOrientation: req.body.southOrientation,
            tilt: req.body.tilt,
        }
        let updatedPlant = await Plant.findByIdAndUpdate(plantId, data, {new: true});
        if(!updatedPlant) {
            throw new Error('E42007');
        };
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: updatedPlant._id,
                name: updatedPlant.name,
                lat: updatedPlant.lat,
                lng: updatedPlant.lng,
                address: updatedPlant.address,
                isActive: updatedPlant.is_active,
                description: updatedPlant.description,
                inverter: updatedPlant.inverter,
                modules: updatedPlant.modules,
                southOrientation: updatedPlant.southOrientation,
                tilt: updatedPlant.tilt,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PLC00006
 * Update specific infor for plant
 * @param {} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated Plant
 */
module.exports.postUpdateSupCus = async(req,res) => {
    try{
        let plantId = req.params.id;
        let data = {
            customer: req.body.customer,
            supplier: req.body.supplier,
        }
        let customer = {};
        let supplier = {}
        if(data.customer && data.customer.length){
            customer = await Customer.findById(data.customer).select('name');
            if(!customer ){
                throw new Error('E42023')
            }
        }
        if(data.supplier && data.supplier.length){
            supplier = await Supplier.findById(data.supplier).select('name');
            if(!supplier ){
                throw new Error('E42023')
            }
        }
        let updatedPlant = await Plant.findByIdAndUpdate(plantId, data, {new: true});
        if(!updatedPlant){
            throw new Error('E42007');
        };
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                customer: customer,
                supplier: supplier,
            }
        })
    } catch(error) {
        console.log(error)
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}


/**PLC00009
 * Assign new devices into plant
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated Plant and added devices
 */
module.exports.assignDevices = async(req,res) => {
    try{
        let plantId = req.params.id;
        let devices = await Device.find({_id:{$in:req.body.devices}});
        if (devices.length !== req.body.devices.length) {
            throw new Error('E42007');
        };
        let isDeviceAssignedYet = devices.every(device => device.plant === null);
        if (!isDeviceAssignedYet) {
            throw new Error('E42008');
        };
        let updatedPlant = await Plant.findByIdAndUpdate(plantId,{$push:{devices: req.body.devices}});
        if(!updatedPlant) {
            throw new Error('E42007');
        };
        await Device.updateMany({_id:{$in:req.body.devices}},{plant:plantId});
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                updatedPlant: updatedPlant,
                addedDevices: devices
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}


/**PLC00011
 * Remove Devices from Plant
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated Plant and removed devices
 */
module.exports.removeDevices = async (req,res) => {
    try{
        let plantId = req.params.id;
        let devices = req.body.devices;
        let devicesInPlant = await Plant.findById(plantId).select('devices');
        if (!devicesInPlant) {
            throw new Error('E42007');
        };
        if (!devices.every(device => devicesInPlant.devices.includes(device))) {
            throw new Error('E42007');
        };
        let updatedPlant = await Plant.findByIdAndUpdate(plantId,{$pullAll:{devices: devices}});
        if(!updatedPlant) {
            throw new Error('E42007');
        };
        await Device.updateMany({_id:{$in:devices}},{plant:null});
        await IotPlant.updateOne({devices: {$in: devices}}, {$pullAll: {devices: devices}});
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                updatedPlant:updatedPlant,
                removedDevices: devices,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PLC0012
 * Delete Plant
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of deleted Plant
 */
module.exports.deletePlant = async (req,res) => {
    try{
        let plantId = req.params.id;
        let plant = await Plant.findById(plantId).select('code name site devices');
        if (!plant) {
            throw new Error('E42007');
        };
        if (plant.devices.length) {
            throw new Error('E42009');
        };
        await Plant.deleteOne({_id:plantId});
        await Site.updateOne({_id:plant.site},{$pull: {plants: plant._id}});
        await IotPlant.deleteMany({plant: plantId});

        //Check whether data in these collection is historical collection?
        await Budget.deleteMany({plant: plantId});
        await BillingConfig.deleteMany({plant:plantId});
        await BillingSchedule.deleteMany({plant: plantId});
        // await RuleConfig.deleteOne({plant: plantId})
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data:{
                _id: plant._id,
                name: plant.name
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

