const Budget = require('../../models/Budget.model');
const Plant = require('../../models/Plant.model');
const {validationResult} = require('express-validator');
const {catchErrors, groupValidationErr} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');
const moment = require('moment')


/**BU00001
 * Get all Budgets in chosen month
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all Budgets 
 */
module.exports.getAllBudgets = async(req, res) => {
    try {
        let [plantId, startQueryBudgetMonth, stopQueryBudgetMonth] = 
        [req.query.plantId, req.query.startQueryMonth, req.query.stopQueryMonth];
        //Check valid Plant
        let plant = await Plant.findById(plantId);
        if(!plant){
            throw new Error('E42007');
        }
        //Check valid date input
        let isValidDateType = 
        moment(startQueryBudgetMonth, 'YYYY-MM').isValid() && moment(startQueryBudgetMonth, 'YYYY-MM').isValid();
        if(!isValidDateType){
            throw new Error('E42028')
        }
        //Format time
        let startQueryMonth = moment(startQueryBudgetMonth).format('X');
        let stopQueryMonth = moment(stopQueryBudgetMonth).format('X')
        let queryMonths = [];
        let noDataMonths = [];
        //Get list of month to query
        while(startQueryMonth <= stopQueryMonth){
            //delete to get all month without data
            queryMonths.push(startQueryMonth);
            startQueryMonth = moment(startQueryMonth, 'X').add(1, 'months').format('X');
        }
        //Query data from DB and format
        let budgets = await Budget.find({plant: plantId, timestamp_unix:{$in: queryMonths}});
        budgets = budgets.map(budget => {
            queryMonths.splice(queryMonths.indexOf(budget.timestamp_unix.toString()), 1)
            return {
                _id: budget._id,
                month: budget.month,
                budgetPerformanceRatio: budget.budget_performance_ratio,
                budgetSpecificYield: budget.budget_specific_yield,
                budgetProduction: budget.budget_production,
            }
        });
        //Get all no-data-month
        noDataMonths = queryMonths.map(monthTimestamp => {
            return moment(monthTimestamp,'X').format('YYYY-MM')
        })
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                budgets: budgets,
                noDataMonths: noDataMonths
            },
          })
    } catch(error) {
        console.log(error)
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**BU00003
 * Add new Budgets
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all Budgets 
 */
module.exports.postAddBudget = async(req,res) => {
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
        let budgetsDb = req.body.monthlyBudgets.map(budget => {
            return {
                plant: plant._id,
                plant_name: plant.name,
                month: budget.month,
                timestamp_unix: moment(budget.month,'YYYY-MM').format('X'),
                budget_performance_ratio: budget.budgetPerformanceRatio,
                budget_specific_yield: budget.budgetSpecificYield,
                budget_production: budget.budgetProduction,
            }
        }); 
        await Budget.insertMany(budgetsDb);

        let budgets = await Budget.find({plant: plantId});
        budgets = budgets.map(budget => {
            return {
                _id: budget._id,
                month: budget.month,
                budgetPerformanceRatio: budget.budget_performance_ratio,
                budgetSpecificYield: budget.budget_specific_yield,
                budgetProduction: budget.budget_production,
            }
        });
        return res.status(httpResponseCode.created).send({
            "code": httpResponseCode.created,
            "message": "OK",
            "data": budgets,
          })
    } catch(error) {
        console.log(error)
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**BU00004
 * Get detailed infor of Budget
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of Budget
 */
module.exports.getBudgetDetails = async(req,res) => {
    try {
        const budgetId = req.params.id;
        let budget = await Budget.findById(budgetId);
        if (!budget){
            throw new Error('E42027');
        }
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": {
                _id: budget._id,
                month: budget.month,
                budgetPerformanceRatio: budget.budget_performance_ratio,
                budgetSpecificYield: budget.budget_specific_yield,
                budgetProduction: budget.budget_production,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**BU00005
 * Update Billing Schedule
 * @param {*} req 
 * @param {*} res 
 * @returns Array of all Budgets 
 */
module.exports.postUpdateBudget = async(req,res) => {
    if (validationResult(req).errors.length){
        let error = new Error('validationError')
        let groupsErr = groupValidationErr(validationResult(req).errors)
        return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
        const budgetId = req.params.id;
        const data = {
            budget_performance_ratio: req.body.budgetPerformanceRatio,
            budget_specific_yield: req.body.budgetSpecificYield,
            budget_production: req.body.budgetProduction,
        }
        data.updated_at = Date.now();
        let updatedBudget = await Budget.findByIdAndUpdate(budgetId, data, {new: true});
        if (!updatedBudget){
            throw new Error('E42027');
        }
        let budgets = await Budget.find({plant: updatedBudget.plant});
        budgets = budgets.map(budget => {
            return {
                _id: budget._id,
                month: budget.month,
                budgetPerformanceRatio: budget.budget_performance_ratio,
                budgetSpecificYield: budget.budget_specific_yield,
                budgetProduction: budget.budget_production,
            }
        });
        return res.status(httpResponseCode.ok).send({
            "code": httpResponseCode.ok,
            "message": "OK",
            "data": budgets
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}
