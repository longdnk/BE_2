const Role = require('../../models/Role.model');
const Permission = require('../../models/Permission.model');
const User = require('../../models/User.model');
const {catchErrors,groupValidationErr} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');
const {validationResult} = require('express-validator');

/**RM00001
 * Get all roles and permissions
 * @param {*} req 
 * @param {*} res 
 * @returns Object of 2 array: roles and permission
 */
module.exports.getRolesAndPermissions = async(req, res) => {
    try {
        let roles = await Role.find({}).select('name description permissions');
        let permissions = await Permission.find({}).select('name');
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data:{
                roles: roles,
                permissions: permissions,
            },
        });
    } 
    catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**RM00002
 * Get details infor of a role
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of role
 */
module.exports.getRoleDetail = async(req, res) => {
    try {
        let roleId = req.params.id;
        let role = await Role.findById(roleId).select('name description permissions');
        if(!role){
            throw new Error('E42002');
        }
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: role
        })
    } 
    catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**RM0004
 * Update role
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated role
 */
module.exports.updateRole = async(req, res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
      };
    try {
        let roleId = req.params.id;
        let role = await Role.findById(roleId).select('name description permissions');
        let permissions = await Permission.find({_id: req.body.permissions});
        if(!role || permissions.length !== req.body.permissions.length){
            throw new Error('E42002');
        }
        let data = {
            description: req.body.description,
            permissions: req.body.permissions,
        };
        let updatedRole = await Role.findOneAndUpdate({ _id: roleId }, data, 
            {'upsert': true, returnOriginal: false }).select('name description permissions')
        if(!updatedRole) {
            throw new Error('E40400')
        }
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: updatedRole,
        })
    } 
    catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**RM00005
 * Remove role
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of id and name of deleted role
 */
module.exports.deleteRole = async(req, res) => {
    try {
        let roleId = req.params.id;
        let deletedRole = await Role.findOneAndDelete({_id:roleId});
        if(!deletedRole){
            throw new Error('E42002');
        }
        await User.updateMany({role: deletedRole.name}, {$set: {role: null}});
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: deletedRole._id,
                name: deletedRole.name,
            },
        })
    } 
    catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

// /**RM00006
//  * Get all Permissions
//  * @param {*} req 
//  * @param {*} res 
//  * @returns 
//  */
// module.exports.getPermissionList = async(req, res) => {
//     try {
//         let permissions = await Permission.find({}).select('name');
//         return res.status(200).send({
//             code:200, 
//             message:'OK', 
//             data: permissions,  
//         })
//     } 
//     catch(error) {
//         return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
//     }
// }

/**RM00007
 * Create new Role;
 * @param {name, permissions, description} req 
 * @param {*} res 
 * @returns Object of detailed infors of new role
 */
module.exports.createRole  = async(req, res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        const newRole = new Role(req.body)
        let permissions = await Permission.find({_id: req.body.permissions});
        if(permissions.length !== req.body.permissions.length){
            throw new Error('E42002');
        }
        await newRole.save()
        return res.status(httpResponseCode.created).send({
            code:httpResponseCode.created, 
            message:'OK', 
            data: {
                _id: newRole._id,
                name: newRole.name,
                permissions: newRole.permissions,
                description: newRole.description,
            }
        })
    } 
    catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}
