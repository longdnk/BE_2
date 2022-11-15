const Plant = require('../../models/Plant.model')
const Iot = require('../../models/Iot.model')
const IotPlantConnection = require('../../models/IotPlant.model')
const Device = require('../../models/Device.model')
const {catchErrors} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');
const {validationResult} = require('express-validator');

/**IP0000
 * Get all IOT - Plant connection
 * @param {*} req 
 * @param {*} res 
 * @returns Array of Iot-plant connection
 */
module.exports.getAllIotPlantConnection = async (req,res) => {
    try{
        let plantId = req.query.plantId;
        let iotPlantConnections = await IotPlantConnection.find({plant: plantId}).select('-created_at -__v');
        let iot = {};
        for(let i=0; i<iotPlantConnections.length; i++){
            iot = await Iot.findById(iotPlantConnections[i].iot).select('name');
            iotPlantConnections[i]={
                _id: iotPlantConnections[i]._id,
                iotId: iotPlantConnections[i].iot,
                iotName: iot.name,
                iotCode: iotPlantConnections[i].iot_code,
                plantId: iotPlantConnections[i].plant,
                plantCode: iotPlantConnections[i].plant_code,
                devices: iotPlantConnections[i].devices,
                infor: iotPlantConnections[i].infor,
            }
        }
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: iotPlantConnections,
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IP0001
 * Get all conditions to create ang update iot-plant connection
 * @param {plantId} req 
 * @param {*} res 
 * @returns Object of 2 Array of Iots and devices
 */
module.exports.getConditions = async (req,res) => {
    try{
        let plantId = req.query.plantId;
        let iotList = await Iot.find().select('name');
        let devices = await Device.find({plant: plantId}).select('name')
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                iots: iotList,
                devices: devices,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IP0002
 * create new iot-plant connection
 * @param {iotId, plantId,} req 
 * @param {*} res 
 * @returns 
 */
module.exports.postCreateConnection = async (req,res) => {
    try{
        let iotId = req.body.iotId
        let plantId = req.body.plantId;
        let plant = await Plant.findById(plantId).select('code');
        if (!plant){
            throw new Error('E42007')
        }
        let iot = await Iot.findById(iotId).select('code');
        if (!iot){
            throw new Error('E42010')
        }
        let checkIot = await IotPlantConnection.find({iot: iotId, plant: plantId});
        if (checkIot.length) {
            throw new Error('E42014')
        }

        let devices = await Device.find({_id:{$in: req.body.devices}, plant: plantId});
        if (devices.length !== req.body.devices.length) {
            throw new Error('E43010')
        }

        let checkDevice = await IotPlantConnection.find({devices: {$in: req.body.devices}, plant: plantId});
        if (checkDevice.length) {
            throw new Error('E42015')
        }

        const data = {
            plant: plant._id,
            plant_code: plant.code,
            iot: iot._id,
            iot_code: iot.code,
            infor: req.body.infor,
            devices: req.body.devices,
        }
        let newIotPlant = new IotPlantConnection(data);
        await newIotPlant.save();

        let devicesInIoT = await Device.find({_id: {$in: newIotPlant.devices}}).select('name');

        newIotPlant = {
                _id: newIotPlant._id,
                iotId: newIotPlant.iot,
                iotCode: newIotPlant.iot_code,
                plantId: newIotPlant.plant,
                plantCode: newIotPlant.plant_code,
                devices: newIotPlant.devices,
                infor: newIotPlant.infor,
            }
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: newIotPlant,
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IP0003
 * Get detailed infor of iot-plant connection
 * @param {_id} req 
 * @param {*} res 
 * @returns 
 */
module.exports.getIotPlantConnectionDetails = async (req,res) => {
    try{
        let connectionId = req.params.id;
        let iotPlantConnection = await IotPlantConnection.findById(connectionId).select('-created_at -__v');
        if(!iotPlantConnection) {
            throw new Error('E42018');
        }
        let devices = [];
        if(iotPlantConnection.devices.length){
            devices = await Device.find({_id: {$in: iotPlantConnection.devices}}).select('name');
            if(!devices.length) {
                throw new Error('E42007')
            }
        }
        let iot = await Iot.findById(iotPlantConnection.iot).select('name');
        if(!iot) {
            throw new Error('E42010')
        }
        iotPlantConnection = {
            _id: iotPlantConnection._id,
            iotId: iotPlantConnection.iot,
            iotCode: iotPlantConnection.iot_code,
            iotName: iot.name,
            plantId: iotPlantConnection.plant,
            plantCode: iotPlantConnection.plant_code,
            devices: devices,
            infor: iotPlantConnection.infor,
        }
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: iotPlantConnection,
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IP0004
 * Update iot-plant connection
 * @param {devices, infor,} req 
 * @param {*} res 
 * @returns 
 */
module.exports.postUpdateConnection = async (req,res) => {
    try{
        let devicesInput = req.body.devices;
        let infor = req.body.infor;
        let connectionId = req.params.id;

        let iotPlantConnection = await IotPlantConnection.findById(connectionId);
        if(!iotPlantConnection) {
            throw new Error('E42018')
        }

        let devices = await Device.find({_id:{$in: devicesInput}, plant: iotPlantConnection.plant});
        if (devices.length !== req.body.devices.length) {
            throw new Error('E43010')
        }

        let numberDeviceAssigned = await IotPlantConnection.find({_id:{$ne: connectionId},devices: {$in:devicesInput}});
        if (numberDeviceAssigned.length) {
            throw new Error('E42015')
        }
        
        const data = {
            devices: devicesInput,
            infor: infor,
        }
        let updatedIotPlantConnection = await IotPlantConnection.findByIdAndUpdate(connectionId, data, {new: true});
        let devicesInIot = await Device.find({_id: {$in: updatedIotPlantConnection.devices}}).select('name');
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: updatedIotPlantConnection._id,
                iotId: updatedIotPlantConnection.iot,
                iotCode: updatedIotPlantConnection.iot_code,
                plantId: updatedIotPlantConnection.plant,
                plantCode: updatedIotPlantConnection.plant_code,
                devices: devicesInIot,
                infor: updatedIotPlantConnection.infor,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**IP0004
 * delete iot-plant connection
 * @param {id} req 
 * @param {*} res 
 * @returns 
 */
module.exports.deleteConnection = async (req,res) => {
    try{
        let connectionId = req.params.id;

        let iotPlantConnection = await IotPlantConnection.findById(connectionId);
        if(!iotPlantConnection) {
            throw new Error('E42018');
        }
        let deletedIotPlantConnection = await IotPlantConnection.findByIdAndDelete(connectionId);
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: deletedIotPlantConnection._id,
                iotCode: deletedIotPlantConnection.iot_code,
                plantCode: deletedIotPlantConnection.plant_code,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}