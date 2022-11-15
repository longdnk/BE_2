const Permission = require('../../models/Permission.model')
const {catchErrors, groupValidationErr} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');
const {validationResult} = require('express-validator');

/**PM0001
 * Get all permissions
 * @param {*} req 
 * @param {*} res 
 * @returns Array of permissions in system
 */
module.exports.getList = async(req, res) => {
    try {
        const permissions = await Permission.find({}).select('-__v -created_at');
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": permissions,
          })
    } 
    catch(error){
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PM0002
 * Update permission
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated permission
 */
module.exports.updatePermission = async(req, res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
      };
    try {
        const permissionId = req.params.id;
        let permission = await Permission.findById(permissionId);
        if(!permission){
            throw new Error('E42002');
        }

        let data = {
            name: req.body.name,
            route: req.body.route,
        };
        let updatedPermission = await Permission.findOneAndUpdate({_id: permissionId},data,
            { 'upsert': true, returnOriginal: false }).select('name route');

        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": updatedPermission,
       })
    } 
    catch(error){
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PM0002.1
 * Get detailed infor of permission
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of permission
 */
module.exports.getUpdatePermission = async(req,res) => {
    try {
        const permission = await Permission.findById({_id: req.params.id}).select('name route');
        if(!permission){
            throw new Error('E42002')
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": permission,
          })
    } 
    catch(error){
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PM0004
 * Create new permission
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of new Permision
 */
module.exports.createPermission = async(req, res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
      };
    try {
        let data = {
            name: req.body.name,
            route: req.body.route
        };
        const newPermission = new Permission(data);
        await newPermission.save();
        // if (req.body.accessRoles.length){
        //     let accessRoles = await Role.updateMany({"_id":{$in:req.body.accessRoles}},
        //     {$push:{permissions:mongoose.Types.ObjectId(permission._id)}},
        //     { 'upsert': true, returnOriginal: false});
        // }
        return res.status(httpResponseCode.created).send({
            "code": httpResponseCode.created,
            "message": "OK",
            "data":{
                _id: newPermission._id,
                name: newPermission.name,
                route: newPermission.route,
            }
       })
    }
    catch(error){
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}
