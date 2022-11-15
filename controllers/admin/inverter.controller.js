const DeviceModel = require('../../models/DeviceModel.model');
const Device = require('../../models/Device.model');
const Protocol = require('../../models/Protocol.model');
const {catchErrors, groupValidationErr} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');
const {validationResult} = require('express-validator');

/**IN00002
 * Get all Inverter Model
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all inverter models
 */
module.exports.getInverters = async(req, res) => {
    try {
        let inverters = await DeviceModel.find({type: "IN"}).select('name paras_model producer protocol');
        //Flatten all fields in model
        inverters = inverters.map(inverter => {
            return Object.assign({
                _id: inverter._id,
                name: inverter.name,
                producer: inverter.producer,
                stringNum: inverter.paras_model.string_num,
                power: inverter.paras_model.power,
                protocolId: inverter.protocol,
                config: inverter.paras_model.config,
            })
        })
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: inverters,
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IN00003
 * Get detailed infor of inverter model
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of inverter model
 */
module.exports.getInverter = async(req, res) => {
    try {
        let inverterId = req.params.id;
        let inverter = await DeviceModel.findById(inverterId).select('name paras_model producer protocol');
        if (!inverter) {
            throw new Error('E42013')
        }
        //Asign indexes for each config
        if(Array.isArray(inverter.paras_model.config) && inverter.paras_model.config){
            inverter.paras_model.config = inverter.paras_model.config.map((config, index)=>{
                return Object.assign(config,{
                    index: index,
                })
            })
        }
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: inverter._id,
                name: inverter.name,
                producer: inverter.producer,
                stringNum: inverter.paras_model.string_num,
                power: inverter.paras_model.power,
                protocolId:inverter.protocol,
                config: inverter.paras_model.config,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IN00004
 * Add new device model 
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed info of new device model
 */
module.exports.postAddInverter  = async(req, res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        let data = {
            name: req.body.name,
            producer: req.body.producer,
            type:"IN",
            paras_model:{
                string_num: req.body.stringNum,
                power: req.body.power,
                config: req.body.config,
            },
            protocol: req.body.protocolId,
        }
        let protocol = await Protocol.findById(req.body.protocolId);
        if(!protocol){
            throw new Error('E42012');
        }
        const inverter = new DeviceModel(data);
        await inverter.save();
        return res.status(httpResponseCode.created).send({
            code:httpResponseCode.created, 
            message:'OK', 
            data: {
                _id: inverter._id,
                name: inverter.name,
                type: inverter.type,
                producer: inverter.producer,
                stringNum: inverter.paras_model.string_num,
                power: inverter.paras_model.power,
                protocolId:inverter.protocol,
                config: inverter.paras_model.config,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IN00005
 * Update all detailed infor of device model
 * @param {_id, name, producer, stringNum, power, config[]} req 
 * @param {*} res 
 * @returns Object of detailed info of updated device model
 */
module.exports.postUpdateInverter  = async(req, res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        let inverterId = req.params.id;
        let data = {
            name: req.body.name,
            producer: req.body.producer,
            paras_model:{
                string_num: req.body.stringNum,
                power: req.body.power,
                config: req.body.config,
            },
        }
        let protocol = await Protocol.findById(req.body.protocolId);
        if(!protocol){
            throw new Error('E42012');
        }
        let updatedInverter = await DeviceModel.findByIdAndUpdate(inverterId,data, {new: true});
        if (!updatedInverter) {
            throw new Error('E42013')
        }
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: updatedInverter._id,
                name: updatedInverter.name,
                type: updatedInverter.type,
                producer: updatedInverter.producer,
                stringNum: updatedInverter.paras_model.string_num,
                power: updatedInverter.paras_model.power,
                config: updatedInverter.paras_model.config,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IN00005.0
 * Get data for a row of config table
 * @param {_id, configIndex} req 
 * @param {*} res 
 * @returns Object of data for a row of config table
 */
module.exports.getUpdateConfig  = async(req, res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        let inverterModelId = req.params.id;
        let inverterModel = await DeviceModel.findById(inverterModelId);
        if (!inverterModel) {
            throw new Error('E42013')
        }
        let config = inverterModel.paras_model.config;
        let configUpdateIndex = req.query.configIndex;
        let configData = config[configUpdateIndex] || {};
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK',
            data: configData,
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IN00005.1
 * Update config table of devce model
 * @param {config[], _id} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated device model
 */
module.exports.postUpdateConfig  = async(req, res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        let inverterModelId = req.params.id;
        let inverterModel = await DeviceModel.findById(inverterModelId);
        if (!inverterModel) {
            throw new Error('E42013');
        }
        let configUpdateData = req.body.config;
        let updatedInverterModel = await DeviceModel.findByIdAndUpdate(inverterModelId,
            {$set: {"paras_model.config": configUpdateData}}, 
            {new: true});
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: updatedInverterModel._id,
                name: updatedInverterModel.name,
                type: updatedInverterModel.type,
                producer: updatedInverterModel.producer,
                stringNum: updatedInverterModel.paras_model.string_num,
                power: updatedInverterModel.paras_model.power,
                config: updatedInverterModel.paras_model.config,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IN00005.2
 * Delete multiple line of config in Device Model
 * @param {config[], _id} req 
 * @param {*} res 
 * @returns  Object of detailed infor of updated device model
 */
module.exports.postDeleteConfig  = async(req, res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        let inverterModelId = req.params.id;
        let inverterModel = await DeviceModel.findById(inverterModelId);
        if (!inverterModel) {
            throw new Error('E42013');
        }
        let config = inverterModel.paras_model.config;
        let configDeleteData = req.body.config || [];

        //Delete each config in configDeleteData 
        for(let i=configDeleteData.length-1 ; i >= 0; i--){
            if(configDeleteData[i].index > config.length-1){
                throw new Error('E40001');
            }
            config.splice(configDeleteData[i],1);
        }
        let updatedInverterModel = await DeviceModel.findByIdAndUpdate(inverterModelId,
            {$set: {"paras_model.config": config}}, 
            {new: true});
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: updatedInverterModel._id,
                name: updatedInverterModel.name,
                type: updatedInverterModel.type,
                producer: updatedInverterModel.producer,
                stringNum: updatedInverterModel.paras_model.string_num,
                power: updatedInverterModel.paras_model.power,
                config: updatedInverterModel.paras_model.config,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IN00005.3
 * Add new config lines in into config table
 * @param {_id, config[]} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated device model
 */
module.exports.postCreateConfig  = async(req, res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        let inverterModelId = req.params.id;
        let inverterModel = await DeviceModel.findById(inverterModelId);
        if (!inverterModel) {
            throw new Error('E42013')
        }
        //Get config --> push into config --> Update config
        let config = inverterModel.paras_model.config;
        let configCreateData = req.body.config || [];
        configCreateData.forEach(data => {
            config.push(data)
        });
        let updatedInverterModel = await DeviceModel.findByIdAndUpdate(inverterModelId,
            {$set: {"paras_model.config": config}}, 
            {new: true});
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: updatedInverterModel._id,
                name: updatedInverterModel.name,
                type: updatedInverterModel.type,
                producer: updatedInverterModel.producer,
                stringNum: updatedInverterModel.paras_model.string_num,
                power: updatedInverterModel.paras_model.power,
                config: updatedInverterModel.paras_model.config,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IN00006
 * Delete device model
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of deatiled infor of deleted devce model
 */
module.exports.deleteInverter  = async(req, res) => {
    try {
        let inverterId = req.params.id;
        let devicesUsingModel = await Device.find({device_model: inverterId});
        if (devicesUsingModel.length){
            throw new Error('E42020')
        }
        let deletedInverter = await DeviceModel.findByIdAndDelete(inverterId);
        if (!deletedInverter) {
            throw new Error('E42013');
        }
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: deletedInverter._id,
                name: deletedInverter.name,
                type: deletedInverter.type,
                producer: deletedInverter.producer,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}