const BillingSchedule = require('../../models/BillingSchedule.model');
const Plant = require('../../models/Plant.model');
const {validationResult} = require('express-validator');
const {catchErrors, groupValidationErr} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');


/**BC00001
 * Get all BillingSchedules
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all BillingSchedules 
 */
module.exports.getAllBillingSchedules = async(req, res) => {
    try {
        let plantId = req.query.plantId;
        let plant = await Plant.findById(plantId);
        if(!plant){
            throw new Error('E42007')
        }
        let billingSchedules = await BillingSchedule.find({plant: plantId});
        billingSchedules = billingSchedules.map(schedule => {
            return {
                _id: schedule._id,
                name: schedule.name,
                code: schedule.code,
                isActive: schedule.is_active,
                startDay: schedule.start_day,
                startDayPremonth: schedule.start_day_premonth,
                endDay: schedule.end_day,
                endDayPremonth: schedule.end_day_premonth,
                runDay: schedule.run_day,
            }
        });
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": billingSchedules,
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**BC00003
 * Add new BillingSchedule
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all BillingSchedules 
 */
module.exports.postAddBillingSchedule = async(req,res) => {
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
        let billingSchedulesDb = req.body.billingSchedules.map(schedule => {
            return {
                plant: plant._id,
                plant_name: plant.name,
                name: schedule.name,
                code: schedule.code,
                is_active: schedule.isActive,
                start_day: schedule.startDay,
                start_day_premonth: schedule.startDayPremonth,
                end_day: schedule.endDay,
                end_day_premonth: schedule.endDayPremonth,
                run_day: schedule.runDay,
            }
        });
        
        await BillingSchedule.insertMany(billingSchedulesDb)

        let billingSchedules = await BillingSchedule.find({plant: plantId});
        billingSchedules = billingSchedules.map(schedule => {
            return {
                _id: schedule._id,
                name: schedule.name,
                code: schedule.code,
                isActive: schedule.is_active,
                startDay: schedule.start_day,
                startDayPremonth: schedule.start_day_premonth,
                endDay: schedule.end_day,
                endDayPremonth: schedule.end_day_premonth,
                runDay: schedule.run_day,
            }
        });
        return res.status(httpResponseCode.created).send({
            "code": httpResponseCode.created,
            "message": "OK",
            "data": billingSchedules,
          })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**BC00004
 * Get detailed infor of BillingSchedule
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of BillingSchedule
 */
module.exports.getBillingScheduleDetails = async(req,res) => {
    try {
        const billingScheduleId = req.params.id;
        let billingSchedule = await BillingSchedule.findById(billingScheduleId);
        if (!billingSchedule){
            throw new Error('E42026');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: billingSchedule._id,
                name: billingSchedule.name,
                code: billingSchedule.code,
                isActive: billingSchedule.is_active,
                startDay: billingSchedule.start_day,
                startDayPremonth: billingSchedule.start_day_premonth,
                endDay: billingSchedule.end_day,
                endDayPremonth: billingSchedule.end_day_premonth,
                runDay: billingSchedule.run_day,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**BC00005
 * Update Billing Schedule
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all BillingSchedules 
 */
module.exports.postUpdateBillingSchedule = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        const billingScheduleId = req.params.id;
        const data = {
            name: req.body.name,
            code: req.body.code,
            is_active: req.body.isActive,
            start_day: req.body.startDay,
            start_day_premonth: req.body.startDayPremonth,
            end_day: req.body.endDay,
            end_day_premonth: req.body.endDayPremonth,
            run_day: req.body.runDay,
        }
        data.updated_at = Date.now();
        let updatedBillingSchedule = await BillingSchedule.findByIdAndUpdate(billingScheduleId, data, {new: true});
        if (!updatedBillingSchedule){
            throw new Error('E42026');
        }
        let billingSchedules = await BillingSchedule.find({plant: updatedBillingSchedule.plant});
        billingSchedules = billingSchedules.map(schedule => {
            return {
                _id: schedule._id,
                name: schedule.name,
                code: schedule.code,
                isActive: schedule.is_active,
                startDay: schedule.start_day,
                startDayPremonth: schedule.start_day_premonth,
                endDay: schedule.end_day,
                endDayPremonth: schedule.end_day_premonth,
                runDay: schedule.run_day,
            }
        });
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": billingSchedules
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**ST0004
 * Delete billingSchedule
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all BillingSchedules 
 */
 module.exports.deleteBillingSchedule  = async(req, res) => {
    try {
        const billingScheduleId = req.params.id;
        let deletedBillingSchedule = await BillingSchedule.findByIdAndDelete(billingScheduleId).select('_id plant');
        if(!deletedBillingSchedule) {
            throw new Error('E42026')
        };
        console.log(deletedBillingSchedule)
        let billingSchedules = await BillingSchedule.find({plant: deletedBillingSchedule.plant});
        billingSchedules = billingSchedules.map(schedule => {
            return {
                _id: schedule._id,
                name: schedule.name,
                code: schedule.code,
                isActive: schedule.is_active,
                startDay: schedule.start_day,
                startDayPremonth: schedule.start_day_premonth,
                endDay: schedule.end_day,
                endDayPremonth: schedule.end_day_premonth,
                runDay: schedule.run_day,
            }
        });
        res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": billingSchedules
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

