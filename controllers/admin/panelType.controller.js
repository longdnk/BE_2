const Panel = require('../../models/PanelType.model');
const String = require('../../models/String.model');
const {catchErrors, groupValidationErr} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');
const {validationResult} = require('express-validator');


/**PA00001
 * Get all panel types
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.getPanelTypes = async(req, res) => {
    try {
        let panels = await Panel.find().select('-created_at -updated_at -__v');
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "data": panels,
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PA00002
 * Add new panel type
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of new Panel Type
 */
module.exports.postAddPanel = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
      };
    if (validationResult(req).errors.length){
        let groupErr = validationResult(req).errors.reduce(function (groups,err) {
            groups[err.param] = groups[err.param] || [];
            groups[err.param].push(err.msg);
            return groups;
        }, Object.create(null));
        let errCode = error.E43009;
        return res.status(400).send(Object.assign(errCode,{errors: groupErr}));
    };
    try {
        let data = req.body;
        data.type = "SP";
        let panel = new Panel(data);
        await panel.save();
        return res.status(httpResponseCode.created).send({
            "code": httpResponseCode.created,
            "message": "OK",
            "data": {
                _id: panel._id,
                name: panel.name,
                producer: panel.producer,
                power: panel.power,
                type: panel.type,
            }
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PA0003
 * Get detailed infor of panel type
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of Panel Type
 */
module.exports.getUpdatePanel = async(req,res) => {
    try {
        const panelId = req.params.id;
        let panel = await Panel.findById(panelId).select('-created_at -__v -type');
        if (!panel) {
            throw new Error('E42013');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": panel,
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PA0004
 * Update panel type
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated Panel Type
 */
module.exports.postUpdatePanel = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
      };
    if (validationResult(req).errors.length){
        let groupErr = validationResult(req).errors.reduce(function (groups,err) {
            groups[err.param] = groups[err.param] || [];
            groups[err.param].push(err.msg);
            return groups;
        }, Object.create(null));
        let errCode = error.E43009;
        return res.status(400).send(Object.assign(errCode,{errors: groupErr}));
    };
    try {
        const panelId = req.params.id;
        let data = req.body;
        let panel = await Panel.findByIdAndUpdate(panelId, data);
        if (!panel) {
            throw new Error('E42013');
        };
        let updatedPanel = await Panel.findById(panelId).select('-created_at -updated_at -__v');
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": updatedPanel
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PA00005
 * Delete panel type
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of deleted Panel Type
 */
module.exports.deletePanel = async(req,res) => {
    try {
        const panelId = req.params.id;
        let stringUsePanels = await String.find({panel_type: panelId});
        if(stringUsePanels.length){
            throw new Error('E42021')
        }
        let panel = await Panel.findByIdAndDelete(panelId);
        if (!panel) {
            throw new Error('E42013');
        };
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: panel._id,
                name: panel.name,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}
