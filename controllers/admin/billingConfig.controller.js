const BillingConfig = require('../../models/BillingConfig.model');
const Plant = require('../../models/Plant.model');
const {validationResult} = require('express-validator');
const {catchErrors, groupValidationErr} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');


/**BC00001
 * Get all BillingConfigs
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all BillingConfigs 
 */
module.exports.getAllBillingConfigs = async(req, res) => {
    try {
        let plantId = req.query.plantId;
        let plant = await Plant.findById(plantId);
        if(!plant){
            throw new Error('E42007')
        }
        let billingConfigs = await BillingConfig.find({plant: plantId});
        billingConfigs = billingConfigs.map(config => {
            return {
                _id: config._id,
                peekLoadTariff: config.price_30,
                normalLoadTariff: config.price_20,
                lowLoadTariff: config.price_10,
                vat: config.vat,
                discount: config.discount,
                infor: config.infor,
                createdAt: config.created_at,
                status: '',
            }
        });
        //Set last value with status In used
        if (billingConfigs.length){
            billingConfigs[billingConfigs.length -1].status = 'In used'
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": billingConfigs,
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**BC00003
 * Add new BillingConfig
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all BillingConfigs 
 */
module.exports.postAddBillingConfig = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        let plantId = req.body.plantId;
        let plant = await Plant.findById(plantId);
        if(!plant){
            throw new Error('E42007')
        }
        const data = {
            plant: plant._id,
            plant_name: plant.name,
            price_10: req.body.lowLoadTariff,
            price_20: req.body.normalLoadTariff,
            price_30: req.body.peakLoadTariff,
            discount: req.body.discount,
            vat: req.body.vat,
            infor: req.body.infor,
        };
        let newBillingConfig = new BillingConfig(data);
        await newBillingConfig.save();

        let billingConfigs = await BillingConfig.find({plant: plantId});
        billingConfigs = billingConfigs.map(config => {
            return {
                _id: config._id,
                peekLoadTariff: config.price_30,
                normalLoadTariff: config.price_20,
                lowLoadTariff: config.price_10,
                vat: config.vat,
                discount: config.discount,
                infor: config.infor,
                createdAt: config.created_at,
                status: '',
            }
        });
        //Set last value with status In used
        if (billingConfigs.length){
            billingConfigs[billingConfigs.length -1].status = 'In used'
        }
        return res.status(httpResponseCode.created).send({
            "code": httpResponseCode.created,
            "message": "OK",
            "data": billingConfigs,
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**BC00004
 * Get detailed infor of BillingConfig
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of BillingConfig
 */
module.exports.getBillingConfigDetails = async(req,res) => {
    try {
        const billingConfigId = req.params.id;
        let billingConfig = await BillingConfig.findById(billingConfigId);
        if (!billingConfig){
            throw new Error('E42025');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                infor: billingConfig.infor,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**BC00005
 * Update Billing Config
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all BillingConfigs 
 */
module.exports.postUpdateBillingConfig = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        const billingConfigId = req.params.id;
        const data = {
            infor: req.body.infor
        };
        data.updated_at = Date.now();
        let updatedBillingConfig = await BillingConfig.findByIdAndUpdate(billingConfigId, data, {new: true});
        if (!updatedBillingConfig){
            throw new Error('E42025');
        }
        let billingConfigs = await BillingConfig.find({plant: updatedBillingConfig.plant});
        billingConfigs = billingConfigs.map(config => {
            return {
                _id: config._id,
                peekLoadTariff: config.price_30,
                normalLoadTariff: config.price_20,
                lowLoadTariff: config.price_10,
                vat: config.vat,
                discount: config.discount,
                infor: config.infor,
                createdAt: config.created_at,
                status: '',
            }
        });
        //Set last value with status In used
        if (billingConfigs.length){
            billingConfigs[billingConfigs.length -1].status = 'In used'
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": billingConfigs
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}



