const Supplier = require('../../models/Supplier.model');
const Plant = require('../../models/Plant.model');
const {validationResult} = require('express-validator');
const {catchErrors, groupValidationErr} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');


/**SM00001
 * Get all Suppliers
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all Suppliers 
 */
module.exports.getAllSuppliers = async(req, res) => {
    try {
        let suppliers = await Supplier.find().select('name group');
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": suppliers,
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}
/**SM00003
 * Add new Supplier
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of new Supplier
 */
module.exports.postAddSupplier = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        const data = {
            name: req.body.name,
            group: req.body.group,
            address: req.body.address,
            tax_number: req.body.taxNumber,
            code: req.body.code,
            is_active: req.body.isActive,
            contact: req.body.contact,
        };
        let newSupplier = new Supplier(data);
        await newSupplier.save();
        return res.status(httpResponseCode.created).send({
            "code": httpResponseCode.created,
            "message": "OK",
            "data": {
                _id: newSupplier._id,
                name: newSupplier.name,
                group: newSupplier.group,
                address: newSupplier.address,
                taxNumber: newSupplier.tax_number,
                code: newSupplier.code,
                isActive: newSupplier.is_active,
                contact: newSupplier.contact,
            }
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**SM00004
 * Get detailed infor of Supplier
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of Supplier
 */
module.exports.getSupplierDetails = async(req,res) => {
    try {
        const supplierId = req.params.id;
        let supplier = await Supplier.findById(supplierId);
        if (!supplier){
            throw new Error('E42023');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: supplier._id,
                name: supplier.name,
                group: supplier.group,
                address: supplier.address,
                taxNumber: supplier.tax_number,
                code: supplier.code,
                isActive: supplier.is_active,
                contact: supplier.contact,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**SM00005
 * Update supplier
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated supplier
 */
module.exports.postUpdateSupplier = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        const supplierId = req.params.id;
        const data = {
            name: req.body.name,
            group: req.body.group,
            address: req.body.address,
            tax_number: req.body.taxNumber,
            code: req.body.code,
            is_active: req.body.isActive,
            contact: req.body.contact,
        };
        data.updated_at = Date.now();
        let updatedSupplier = await Supplier.findByIdAndUpdate(supplierId, data, {new: true});
        if (!updatedSupplier){
            throw new Error('E42023');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: updatedSupplier._id,
                name: updatedSupplier.name,
                group: updatedSupplier.group,
                address: updatedSupplier.address,
                taxNumber: updatedSupplier.tax_number,
                code: updatedSupplier.code,
                isActive: updatedSupplier.is_active,
                contact: updatedSupplier.contact,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**SM00006
 * Delete Supplier
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of deleted deleted Supplier
 */
module.exports.deleteSupplier = async(req,res) => {
    try {
        const supplierId = req.params.id;
        let deletedSupplier = await Supplier.findByIdAndDelete(supplierId);
        let plant = await Plant.find({supplier: supplierId});
        if (plant.length){
            throw new Error('E42024')
        }
        if (!deletedSupplier){
            throw new Error('E42023');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: deletedSupplier._id,
                name: deletedSupplier.name,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}


