const Device = require('../../models/Device.model');
const Plant = require('../../models/Plant.model');
const DeviceModel = require('../../models/DeviceModel.model');
const Panel = require('../../models/PanelType.model');
const String = require('../../models/String.model');
const Protocol = require('../../models/Protocol.model');
const {catchErrors} = require('../../helpers/errorCatching');
const {getCodeOfNextElement} = require('../../helpers/commonHelpers');
const httpResponseCode = require('../../common/httpResponseCode');
const iotPlant = require('../../models/IotPlant.model');

/**DC0001
 * Get details of basic infor of device 
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of details of basic infor of device 
 */
module.exports.getBasicDetails  = async(req, res) => {
    try {
        const deviceId = req.params.id;
        let deviceBasic = await Device.findById(deviceId).select('code name device_model plant is_active type');
        if(!deviceBasic) {
            throw new Error('E42007')
        };
        let plant = await Plant.findById(deviceBasic.plant).select('name code -_id');
        let deviceModel = await DeviceModel.findById(deviceBasic.device_model).select('name');
        deviceModel = deviceModel || {};
        deviceBasic = {
                _id: deviceBasic._id,
                code: deviceBasic.code,
                name: deviceBasic.name,
                type: deviceBasic.type,
                isActive: deviceBasic.is_active,
                deviceModel: deviceModel,
                plant: plant
            }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": deviceBasic
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**DC0002
 * Get details of paras infor of device 
 * @param {*_id} req 
 * @param {*} res 
 * @returns Object of details of paras infor of device 
 */
module.exports.getParasDetails  = async(req, res) => {
    try {
        const deviceId = req.params.id;
        let deviceParas = await Device.findById(deviceId).select('paras');
        if(!deviceParas) {
            throw new Error('E42007')
        };
        deviceParas = {
                _id: deviceParas._id,
                parasInfor: deviceParas.paras.paras_infor || {},
                parasConfig: deviceParas.paras.paras_config || {},
                parasTag: deviceParas.paras.paras_tag || undefined,
            }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": deviceParas
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**DC0003
 * Get details of model infor of device 
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of details of model infor of device 
 */
module.exports.getModelDetails  = async(req, res) => {
    try {
        const deviceId = req.params.id;
        let device = await Device.findById(deviceId).select('device_model');
        if(!device) {
            throw new Error('E42007')
        };
        let deviceModel = await DeviceModel.findById(device.device_model).select('producer name paras_model type');
        if(deviceModel){
            deviceModel = {
                producer: deviceModel.producer,
                name: deviceModel.name,
                type: deviceModel.type,
                power: deviceModel.paras_model.power,
                stringNum: deviceModel.paras_model.string_num,
            }
        } else {
            deviceModel = {}
        }
        device = {
            _id: device._id,
            deviceModel: deviceModel,
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": device
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**DC0005
 * Update details of basic infor of device 
 * @param {_id, name isActive} req 
 * @param {*} res 
 * @returns Object of details of basic infor of updated device 
 */
module.exports.postBasicDetails  = async(req, res) => {
    try {
        const deviceId = req.params.id;
        let device = await Device.findById(deviceId);
        if(!device) {
            throw new Error('E42007')
        };
        let data = {
            name: req.body.name,
            is_active: req.body.isActive,
        }
        let deviceBasic = await Device.findByIdAndUpdate(deviceId, data, {new: true});
        let plant = await Plant.findById(deviceBasic.plant).select('name code -_id');
        let deviceModel = await DeviceModel.findById(deviceBasic.device_model).select('name');
        deviceBasic = {
                _id: deviceBasic._id,
                code: deviceBasic.code,
                name: deviceBasic.name,
                isActive: deviceBasic.is_active,
                deviceModel: deviceModel || {},
                plant: plant
            }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": deviceBasic
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**DC0006
 * Update details of paras infor of device 
 * @param {_id, parasInfor parasConfig} req 
 * @param {*} res 
 * @returns Object of details of paras infor of updated device 
 */
module.exports.postParasDetails  = async(req, res) => {
    try {
        const deviceId = req.params.id;
        let device = await Device.findById(deviceId);
        if(!device) {
            throw new Error('E42007')
        };
        let data = {
            paras:{
                paras_infor: req.body.parasInfor,
                paras_config: req.body.parasConfig,
            }
        }   
        if(device.type !== "inverter") {
            data.paras.paras_tag = req.body.parasTag || [];
        }
        let deviceParas = await Device.findByIdAndUpdate(deviceId, data, {new:true});
        deviceParas = {
                _id: deviceParas._id,
                parasInfor: deviceParas.paras.paras_infor,
                parasConfig: deviceParas.paras.paras_config,
                parasTag: deviceParas.paras.paras_tag || undefined,
            }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": deviceParas
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**DC0006
 * Get condition tto create new Device
 * @param {_id, parasInfor parasConfig} req 
 * @param {*} res 
 * @returns Object of nextCode, panelModels, inverterModels and protocols
 */
module.exports.getDeviceCondition  = async(req, res) => {
    try {
        let lastDevice = await Device.find().limit(1).sort({$natural:-1}).select('code');
        let code = 'DE00000'
        if(lastDevice.length){
            code =  (getCodeOfNextElement(lastDevice[0].code))
        }
        let panels = await Panel.find().select('name power');
        let inverters = await DeviceModel.find({type:"IN"}).select('name paras_model protocol');
        let protocols = await Protocol.find().select('name paras_infor paras_config paras_tag data_type');
        protocols = protocols.map(protocol =>{
            return {
                _id: protocol._id,
                name: protocol.name,
                parasConfig: protocol.paras_config,
                parasInfor: protocol.paras_infor,
                parasTag: protocol.paras_tag,
                dataType: protocol.data_type
            }
        })
        for (let i=0; i<inverters.length; i++){
            inverters[i] = {
                _id: inverters[i]._id,
                name: inverters[i].name,
                stringNum: inverters[i].paras_model.string_num,
                protocol: inverters[i].protocol,
            }
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                nextDeviceCode:code,
                panelModels: panels,
                inverterModels: inverters,
                protocols: protocols
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**DC00009
 * Add new Device
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of new device
 */
module.exports.postAddDevice  = async(req, res) => {
    try {
        let data = {
            code: req.body.code,
            name: req.body.name,
            type: req.body.type.toLowerCase(),
            is_active: req.body.isActive,
            plant: req.body.plantId,
            paras: {
                paras_infor: req.body.parasInfor,
                paras_config: req.body.parasConfig,
            }
        }
        if(req.body.type !== "inverter") {
            data.paras.paras_tag = req.body.parasTag || [];
        } else {
            data.device_model = req.body.deviceModel;
        }
        let newDevice = new Device(data);
        await Plant.findByIdAndUpdate(data.plant,{$push:{devices: newDevice._id}})
        let string = null;
        let stringDetails = req.body.stringDetails||[];
        if(stringDetails.length && newDevice.type ==="inverter"){
            stringDetails = stringDetails.map((string,index) => {
                return {
                    name: `${req.body.name}#${index+1}`,
                    pv_module: string.pvModule,
                    panel_type: string.panelType,
                    device: newDevice._id,
                }
            })
            string = await String.insertMany(stringDetails);
            string = string.map(element => {
                return {
                    _id: element._id,
                    name: element.name,
                    pvModule: element.pv_module,
                    panelType: element.panel_type,
                    device: newDevice._id,
                }
            })
        }
        await newDevice.save();
        return res.status(httpResponseCode.created).send({
            "code": httpResponseCode.created,
            "message": "OK",
            "data": {
                _id: newDevice._id, 
                code: newDevice.code,
                name: newDevice.name,
                type: newDevice.type,
                isActive: newDevice.is_active,
                plantId: newDevice.plant,
                parasInfor: newDevice.paras.paras_infor,
                parasConfig: newDevice.paras.paras_config,
                parasTag: newDevice.paras.paras_tag || undefined,
                deviceModel: newDevice.device_model || undefined,
                stringDetails: string || undefined,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}


/**DC00010
 * Duplicate device
 * @param {duplicatedDeviceNum, parasConfig[]} req 
 * @param {*} res 
 * @returns Object of detailed infor of duplicated device
 */
module.exports.duplicateDevice  = async(req, res) => {
    try {
        const deviceId = req.params.id;
        //check Device exist and Device Inverter only
        let device = await Device.findById(deviceId);
        if(!device) {
            throw new Error('E42007')
        };
        if(device.type !== 'inverter') {
            throw new Error('E42017')
        };

        //Get data from FE, check duplicateNum must equal to numver of paras Config
        let duplicatedDeviceNum = req.body.duplicatedDeviceNum;
        let parasConfig = req.body.parasConfig;
        if(duplicatedDeviceNum !== parasConfig.length){
            {
                throw new Error('E42016')
            };
        }
        //Get next code of Device
        let lastDevice = await Device.find().limit(1).sort({$natural:-1}).select('code');
        let getPart = lastDevice[0].code.replace(/[^\d.]/g, '');
        let num = parseInt(getPart); 
        //Get string detail of chosen device to dupliate to new devices
        let stringDetails = await String.find({device: device._id}).select('pv_module panel_type -_id');
        
        //Handle duplicated 1 device multiple times
        let prevDuplicatedDeviceRegex = new RegExp(`\\${device.name}-[0-9][0-9]{0,2}$`,'g');
        let prevDuplicatedDevice = await Device.find({name: prevDuplicatedDeviceRegex}).limit(1).sort({$natural:-1});
        let prevDuplicatedDeviceIndex = 0;
        //Get last index of last duplicated device
        if(prevDuplicatedDevice.length){
            prevDuplicatedDeviceIndex = parseInt(prevDuplicatedDevice[0].name.split('-').slice(-1)[0])
        }
        //Define variables used in loop
        let newVal = 0;
        let reg = new RegExp();
        let data = {};
        let duplicateDevice = {};
        //Loop to create each device
        for(let i=1; i<=duplicatedDeviceNum; i++){
            newVal = num+i;         
            reg = new RegExp(num); 
            data = {
                code: lastDevice[0].code.replace(reg, newVal),
                name: `${device.name}-${prevDuplicatedDeviceIndex+i}`,
                type: device.type,
                is_active: device.is_active,
                plant: device.plant,
                paras: {
                    paras_infor: device.paras.paras_infor,
                    paras_config: parasConfig[i-1],
                    paras_tag: device.paras.paras_tag
                },
                device_model: device.device_model,
                pString: device.pString,
            }
            duplicateDevice = new Device(data);
            await duplicateDevice.save();
            await Plant.findByIdAndUpdate(duplicateDevice.plant, {$push: {devices: duplicateDevice._id}});
            stringDetails = stringDetails.map((string,index) => {
                return {
                    name: `${duplicateDevice.name}#${index+1}`,
                    pv_module: string.pv_module,
                    panel_type: string.panel_type,
                    device: duplicateDevice._id,
                }
            })
            await String.insertMany(stringDetails);
        }
        let devicesInPlant = await Device.find({plant: device.plant}).select('name code')

        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": devicesInPlant
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**DC00011
 * delete device
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of deleted device
 */
module.exports.deleteDevice = async(req,res) => {
    try{
        let deviceId = req.params.id;
        let device = await Device.findById(deviceId);
        if(!device) {   
            throw new Error('E42007')
        };
        let deletedDevice = await Device.findByIdAndDelete(deviceId).select('name code -_id');
        await String.deleteMany({device: deviceId});
        await Plant.updateOne({_id:device.plant},{$pull: {devices: device._id}})
        await iotPlant.findOneAndUpdate({devices: deviceId}, {$pull: {devices: deviceId}})
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": deletedDevice,
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}