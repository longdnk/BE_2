const Plant = require('../../models/Plant.model');
const Iot = require('../../models/Iot.model');
const IotPlant = require('../../models/IotPlant.model');
const {validationResult} = require('express-validator');
const {catchErrors, groupValidationErr} = require('../../helpers/errorCatching');
const {getCodeOfNextElement} = require('../../helpers/commonHelpers');
const httpResponseCode = require('../../common/httpResponseCode');


/**IOT00001
 * Get all IOT Devices and detailed infor of plants managing them
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all Iot Devices 
 */
module.exports.getAllIot = async(req, res) => {
    try {
        let iotDevices = await Iot.find().select('name code');
        let plantIdArray = [];
        let plant = [];
        let plantList = [];
        //Change form for data as required in FE, find and add plant details in each Iot
        for(let i=0; i<iotDevices.length; i++){
            plantIdArray = [];
            plant = await IotPlant.find({iot_code: iotDevices[i].code}).select('plant_code');
            for (let j=0; j<plant.length; j++){
                plantIdArray.push(plant[j].plant_code)
            }
            plantList = await Plant.find({code: {$in: plantIdArray}}).select('name code -_id');
            iotDevices[i] = {
                _id: iotDevices[i]._id,
                name: iotDevices[i].name,
                code: iotDevices[i].code,
                plant: plantList,
            }
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": iotDevices,
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IOT00002
 * Get next Code when create new IOT
 * @param {*} req 
 * @param {*} res 
 * @returns Next IOT code
 */
module.exports.getNextIotCode = async(req, res) => {
    try {
        let lastIot = await Iot.find().limit(1).sort({$natural:-1}).select('code');
        let code = 'DL000001'
        if(lastIot.length){
            code = getCodeOfNextElement(lastIot[0].code)
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                nextCode: code,
            }
       })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IOT00003
 * Add new IOT
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of new IOT
 */
module.exports.postAddIot = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        const data = {
            name: req.body.name,
            code: req.body.code,
        };
        let iot = new Iot(data);
        await iot.save();
        return res.status(httpResponseCode.created).send({
            "code": httpResponseCode.created,
            "message": "OK",
            "data": {
                _id: iot._id,
                name: iot.name,
            }
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IOT00004
 * Get detailed infor of Iot
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of Iot
 */
module.exports.getUpdateIot = async(req,res) => {
    try {
        const iotId = req.params.id;
        let iot = await Iot.findById(iotId).select('name');
        if (!iot){
            throw new Error('E42010');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: iot._id,
                name: iot.name,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IOT00005
 * Update iot
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated Iot
 */
module.exports.postUpdateIot = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        const iotId = req.params.id;
        let data = req.body;
        data.updated_at = Date.now();
        let iot = await Iot.findByIdAndUpdate(iotId, data);
        if (!iot){
            throw new Error('E42010');
        }
        let updatedIot = await Iot.findById(iotId).select('name');
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: updatedIot._id,
                name: updatedIot.name,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IOT00006
 * Delete iot
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of deleted iot
 */
module.exports.deleteIot = async(req,res) => {
    try {
        const iotId = req.params.id;
        let iotConnections = await IotPlant.find({iot: iotId});
        if (iotConnections.length){
            throw new Error('E42022')
        }
        let iot = await Iot.findByIdAndDelete(iotId);
        if (!iot){
            throw new Error('E42010');
        }
        await IotPlant.deleteMany({iot: iotId});
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: iot._id,
                name: iot.name,
                code: iot.code
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}


