const Protocol = require('../../models/Protocol.model')
const Device = require('../../models/Device.model')
const {catchErrors,groupValidationErr} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');
const {validationResult} = require('express-validator');
const DeviceModel = require('../../models/DeviceModel.model');


/**PR00001
 * Get all protocols
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all protocols
 */
module.exports.getAllProtocols = async(req, res) => {
    try {
        let protocolList = await Protocol.find().select('-created_at -updated_at -__v');
        protocolList = protocolList.map(protocol => {
            return {
                _id: protocol._id,
                name: protocol.name,
                parasInfor: protocol.paras_infor,
                parasConfig: protocol.paras_config,
                parasTag: protocol.paras_tag,
                dataType: protocol.data_type,
            }
        })
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": protocolList,
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PR00002
 * Add new protocols
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed info of new protocol
 */
module.exports.postAdd = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        let data = {
            name: req.body.name,
            paras_infor: req.body.parasInfor,
            paras_tag: req.body.parasTag,
            paras_config: req.body.parasConfig,
            data_type: req.body.dataType,
        };
        let protocol = new Protocol(data);
        await protocol.save();
        return res.status(httpResponseCode.created).send({
            "code": httpResponseCode.created,
            "message": "OK",
            "data": {
                _id: protocol._id,
                name: protocol.name,
                parasInfor: protocol.paras_infor,
                parasConfig: protocol.paras_config,
                parasTag: protocol.paras_tag,
                dataType: protocol.data_type,
            }
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PR00003
 * Get detailed infor of protocol
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed info of protocol
 */
module.exports.getUpdate = async(req,res) => {
    try {
        const protocolId = req.params.id;
        let protocol = await Protocol.findById(protocolId).select('-created_at -__v');
        if (!protocol){
            throw new Error('E42012')
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: protocol._id,
                name: protocol.name,
                parasInfor: protocol.paras_infor,
                parasConfig: protocol.paras_config,
                parasTag: protocol.paras_tag,
                dataType: protocol.data_type,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PR00004
 * Update protocol
 * @param {*_id} req 
 * @param {*} res 
 * @returns Object of detailed info of updated protocol
 */
module.exports.postUpdate = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        const protocolId = req.params.id;
        let data = {
            name: req.body.name,
            paras_infor: req.body.parasInfor,
            paras_tag: req.body.parasTag,
            paras_config: req.body.parasConfig,
            data_type: req.body.dataType,
        };
        let protocol = await Protocol.findByIdAndUpdate(protocolId, data);
        if (!protocol){
            throw new Error('E42012')
        }
        let updatedProtocol = await Protocol.findById(protocolId).select('-created_at -updated_at -__v');
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: updatedProtocol._id,
                name: updatedProtocol.name,
                parasInfor: updatedProtocol.paras_infor,
                parasConfig: updatedProtocol.paras_config,
                parasTag: updatedProtocol.paras_tag,
                dataType: updatedProtocol.data_type,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PR00006
 * Delete protocol
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of _id and name of deleted protocol
 */
module.exports.delete = async(req,res) => {
    try {
        const protocolId = req.params.id;
        let deviceModels = await DeviceModel.find({protocol: protocolId});
        if (deviceModels.length){
            throw new Error('E42011');
        }
        
        let protocol = await Protocol.findByIdAndDelete(protocolId);
        if (!protocol){
            throw new Error('E42012');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: protocol._id,
                name: protocol.name,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}
