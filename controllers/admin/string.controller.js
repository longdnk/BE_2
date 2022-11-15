const Device = require('../../models/Device.model')
const DeviceModel = require('../../models/DeviceModel.model')
const Panel = require('../../models/PanelType.model')
const String = require('../../models/String.model')
const {catchErrors} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');

/**ST0001
 * Get all string in Device
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of stringNum and stringDetails of Device
 */
module.exports.getStringDetails  = async(req, res) => {
    try {
        const deviceId = req.query.deviceId;
        let device = await Device.findById(deviceId);
        if(!device) {
            throw new Error('E42007')
        };
        let deviceModel = await DeviceModel.findById(device.device_model);
        if(!deviceModel) {
            return res.status(httpResponseCode.ok).send({
                "code": httpResponseCode.ok,
                "message": "OK",
                "data": {}
            })
        }
        let stringsInDevice = await String.find({device: deviceId}).select('-__v -created_at -updated_at -device');
        let panel = {};
        for(let i=0; i<stringsInDevice.length; i++){
            panel = await Panel.findById(stringsInDevice[i].panel_type).select('name power');
            stringsInDevice[i] = {
                _id: stringsInDevice[i]._id,
                pvModule: stringsInDevice[i].pv_module,
                panelType: panel,
            }
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                stringNum: deviceModel.paras_model.string_num,
                stringDetails: stringsInDevice,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**ST0002
 * add new string in device
 * @param {deviceId, strings[]} req 
 * @param {*} res 
 * @returns Array of new Strings
 */
module.exports.addString  = async(req, res) => {
    try {
        let strings = req.body.strings;
        let deviceId = req.body.deviceId;
        let device = await Device.findById(deviceId);
        if(!device) {
            throw new Error('E42007')
        };
        let latestStringInDevice = await String.find({device: deviceId}).limit(1).sort({$natural:-1}).select('name');
        //Get next index of String
        let num = 1; 
        if(latestStringInDevice.length){
            let getPart = latestStringInDevice[0].name.split('#')[1];
            num = parseInt(getPart) + 1; 
        }
        strings = strings.map((string,index) => {
            return {
                device: deviceId,
                name: `${device.name}#${num+index}`,
                pv_module: string.pvModule,
                panel_type: string.panelType,
            }
        })
        await String.insertMany(strings);

        let stringsInDevice = await String.find({device: deviceId}).select('-__v -created_at -updated_at -device');
        let panel = {};
        for(let i=0; i<stringsInDevice.length; i++){
            panel = await Panel.findById(stringsInDevice[i].panel_type).select('name');
            stringsInDevice[i] = {
                _id: stringsInDevice[i]._id,
                pvModule: stringsInDevice[i].pv_module,
                panelType: panel,
            }
        }
        res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": stringsInDevice
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**ST0003
 * Update String 
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed data of updated string
 */
module.exports.updateString  = async(req, res) => {
    try {
        const stringId = req.params.id;
        let dataUpdate = {
            pv_module: req.body.pvModule,
            panel_type: req.body.panelType,
        }
        let string = await String.findById(stringId).select('device');
        if(!string) {
            throw new Error('E42019')
        };

        await String.findByIdAndUpdate(stringId, dataUpdate);

        let stringsInDevice = await String.find({device: string.device}).select('-__v -created_at -updated_at -device');
        let panel = {};
        for(let i=0; i<stringsInDevice.length; i++){
            panel = await Panel.findById(stringsInDevice[i].panel_type).select('name');
            stringsInDevice[i] = {
                _id: stringsInDevice[i]._id,
                pvModule: stringsInDevice[i].pv_module,
                panelType: panel,
            }
        }
        res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": stringsInDevice
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**ST0004
 * Delete string
 * @param {*} req 
 * @param {*} res 
 * @returns Object of deleted string
 */
module.exports.deleteString  = async(req, res) => {
    try {
        const stringId = req.params.id;
        let deletedString = await String.findByIdAndDelete(stringId).select('_id');
        if(!deletedString) {
            throw new Error('E42019')
        };
        res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": deletedString
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}