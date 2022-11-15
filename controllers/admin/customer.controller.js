const Customer = require('../../models/Customer.model');
const Plant = require('../../models/Plant.model');
const {validationResult} = require('express-validator');
const {catchErrors, groupValidationErr} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');


/**SM00001
 * Get all Customers
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all Customers 
 */
module.exports.getAllCustomers = async(req, res) => {
    try {
        let customers = await Customer.find().select('name email');
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": customers,
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}
/**SM00003
 * Add new Customer
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of new Customer
 */
module.exports.postAddCustomer = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        const data = {
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone,
            tax_number: req.body.taxNumber,
            code: req.body.code,
            email: req.body.email,
            address_use: req.body.addressUse,
            purpose: req.body.purpose,
            type: req.body.type,
        };
        let newCustomer = new Customer(data);
        await newCustomer.save();
        return res.status(httpResponseCode.created).send({
            "code": httpResponseCode.created,
            "message": "OK",
            "data": {
                _id: newCustomer._id,
                name: newCustomer.name,
                address: newCustomer.address,
                phone: newCustomer.phone,
                taxNumber: newCustomer.tax_number,
                code: newCustomer.code,
                email: newCustomer.email,
                addressUse: newCustomer.address_use,
                purpose: newCustomer.purpose,
                type: newCustomer.type,
            }
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**SM00004
 * Get detailed infor of Customer
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of Customer
 */
module.exports.getCustomerDetails = async(req,res) => {
    try {
        const customerId = req.params.id;
        let customer = await Customer.findById(customerId);
        if (!customer){
            throw new Error('E42023');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: customer._id,
                name: customer.name,
                address: customer.address,
                phone: customer.phone,
                taxNumber: customer.tax_number,
                code: customer.code,
                email: customer.email,
                addressUse: customer.address_use,
                purpose: customer.purpose,
                type: customer.type,
                isActive: updatedCustomer.is_active,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**SM00005
 * Update customer
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated customer
 */
module.exports.postUpdateCustomer = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        const customerId = req.params.id;
        const data = {
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone,
            tax_number: req.body.taxNumber,
            code: req.body.code,
            email: req.body.email,
            address_use: req.body.addressUse,
            purpose: req.body.purpose,
            type: req.body.type,
        };
        data.updated_at = Date.now();
        let updatedCustomer = await Customer.findByIdAndUpdate(customerId, data, {new: true});
        if (!updatedCustomer){
            throw new Error('E42023');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: updatedCustomer._id,
                name: updatedCustomer.name,
                address: updatedCustomer.address,
                phone: updatedCustomer.phone,
                taxNumber: updatedCustomer.tax_number,
                code: updatedCustomer.code,
                email: updatedCustomer.email,
                addressUse: updatedCustomer.address_use,
                purpose: updatedCustomer.purpose,
                type: updatedCustomer.type,
                isActive: updatedCustomer.is_active,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**SM00006
 * Delete Customer
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of deleted deleted Customer
 */
module.exports.deleteCustomer = async(req,res) => {
    try {
        const customerId = req.params.id;
        let deletedCustomer = await Customer.findByIdAndDelete(customerId);
        let plant = await Plant.find({customer: customerId});
        if (plant.length){
            throw new Error('E42024')
        }
        if (!deletedCustomer){
            throw new Error('E42023');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: deletedCustomer._id,
                name: deletedCustomer.name,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}


