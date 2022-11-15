const err = require('../../common/err');
const status = require('../../common/status');
const ruleCondition = require('../../common/rule');
const Field = require('../../models/RuleField.model');
const Rule = require('../../models/RuleConfig.model');
const Operator = require('../../models/RuleOperator.model');
const Device = require('../../models/Device.model');
const Plant = require('../../models/Plant.model');
const User = require('../../models/User.model');
const expressValidator = require('express-validator');
const {validationResult} = require('express-validator');
const RuleOperator = require('../../models/RuleOperator.model');

//B0001
module.exports.getRuleConditions = async (req, res) => {
    try {
        const plantId = req.query.plantId;
        let plant = await Plant.findById(plantId);
        if (!plant) return res.status(400).send(err.E43002);
        let groupUser = await User.find({sites: plant.site}).select('name email role');
        //phân nhóm theo Role
        groupUser = groupUser.reduce(function (groups,user) {
            groups[user.role] = groups[user.role] || [];
            groups[user.role].push({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
            return groups;
        }, Object.create(null));

        let fields = await Field.find({is_active: 1}).select('code name is_active -_id');
        fields = fields.map(field => {   
            return {
                code: field.code,
                name: field.name,
            }
        })
        let operators = await Operator.find({is_active: 1}).select('-description -created_at -updated_at -_id');
        operators = operators.map(operator =>{
            return {
                code: operator.code,
                name: operator.name,
            }
        })
        let statusKeys = Object.keys(ruleCondition.status);
        statusKeys = statusKeys.map(status =>{
            return{
                code: parseInt(status),
                name: ruleCondition.status[status],
            }
        })
        let severityKeys = Object.keys(ruleCondition.severity);
        severityKeys = severityKeys.map(severity =>{
            return{
                code: parseInt(severity),
                name: ruleCondition.severity[severity],
            }
        })
        let trackingTimeKeys = Object.keys(ruleCondition.trackingTime);
        trackingTimeKeys = trackingTimeKeys.map(trackingTime =>{
            return{
                code: trackingTime,
                name: ruleCondition.trackingTime[trackingTime],
            }
        })
        let ruleTypeKeys = Object.keys(ruleCondition.ruleType);
        ruleTypeKeys = ruleTypeKeys.map(ruleType =>{
            return{
                code: parseInt(ruleType),
                name: ruleCondition.ruleType[ruleType],
            }
        })
        res.status(200).send({
            "code": 200,
            "message": "OK",
            "data": {
                fields: fields,
                operators: operators,
                userGroups: groupUser,
                status: statusKeys,
                severity: severityKeys,
                ruleTime: trackingTimeKeys,
                ruleType: ruleTypeKeys,
            }
        })
    } catch (error) {
        if (error.kind && error.kind === "ObjectId") return res.status(400).send(err.E43008);
        res.status(400).send(err.E40001);
    }
}

//B0002
module.exports.getDevicesInPlant = async (req, res) => {
    try {
        const plantId = req.query.plantId;
        let plant = await Plant.findById(plantId);
        if (!plant) return res.status(400).send(err.E43002);
        let devices = await Device.find({plant:plantId}).select('name type');
        devices = devices.map(device =>{
            return{
                id: device._id,
                name: device.name,
                type: device.type, 
            }
        })
        res.status(200).send({
            "code": 200,
            "message": "OK",
            "data":  devices,
        })
    } catch (error) {
        if (error.kind && error.kind === "ObjectId") return res.status(400).send(err.E43008);
        res.status(400).send(err.E40001);
    }
}

//B0003
module.exports.postAdd = async (req, res) => {
    try {
      if (validationResult(req).errors.length){
        let groupErr = validationResult(req).errors.reduce(function (groups,err) {
            groups[err.param] = groups[err.param] || [];
            groups[err.param].push(err.msg);
            return groups;
        }, Object.create(null));
        let errCode = err.E43009
        return res.status(400).send(Object.assign(errCode,{errors: groupErr}))
    };
        const data = {
            name: req.body.name,			
            rule_type: req.body.ruleType,
            rule_time: req.body.ruleTime,			
            is_active: req.body.isActive,			
            plant: req.body.plantId,			
            device: req.body.devices,						
            value: req.body.value,			
            severity: req.body.severity,			
            message: req.body.message,
            email: req.body.reportMethods.includes("email")? 1 : 0,		
            phone: req.body.reportMethods.includes("phone")? 1 : 0,			
            sms: req.body.reportMethods.includes("sms")? 1 : 0,			
            recipients: req.body.recipients,
            others: ((typeof req.body.otherEmails === 'string' || req.body.otherEmails instanceof String) && req.body.otherEmails.length)
            ? req.body.otherEmails.split(',')
            : [],
        }
        let plant = await Plant.findById(data.plant);
        if (!plant) return res.status(400).send(err.E43002);

        let field = await Field.find({code: req.body.ruleField});
        if (!field.length) return res.status(400).send(err.E43006);
        data.rule_field = field[0]._id;

        let operator = await Operator.find({code: req.body.ruleOperator});
        if (!operator.length) return res.status(400).send(err.E43007);
        data.rule_operator = operator[0]._id;

        let device = await Device.find({_id: {$in: req.body.devices}});
        if (device.length !== req.body.devices.length) return res.status(400).send(err.E43010);

        let recipients = await User.find({_id: {$in: req.body.recipients}});
        if (recipients.length !== req.body.recipients.length) return res.status(400).send(err.E43011);

        if (req.body.ruleType === 0) data.device = [];
        let rule = new Rule(data);  
        await rule.save();

        let ruleFieldDetails = await Field.findById(rule.rule_field).select('name code');
        let ruleOperatorDetails = await Operator.findById(rule.rule_operator).select('name code description');

        let reportMethods = [];
        if (rule.email){
            reportMethods.push("email")
        }
        if (rule.phone){
            reportMethods.push("phone")
        }
        if (rule.sms){
            reportMethods.push("sms")
        }
        res.status(200).send({
            "code": 200,
            "message": "OK",
            "data": {
                id: rule._id,
                name: rule.name,
                devices: rule.device,
                plantId: rule.plant,
                value: rule.value,
                ruleType: rule.rule_type,
                ruleTypeText:ruleCondition.ruleType[rule.rule_type],
                ruleTime: rule.rule_time,
                ruleTimeText: ruleCondition.trackingTime[rule.rule_time],
                ruleField: ruleFieldDetails.code,
                ruleFieldText: ruleFieldDetails.name,
                ruleOperator: ruleOperatorDetails.code,
                ruleOperatorText: ruleOperatorDetails.name,
                severity: rule.severity,
                severityText: ruleCondition.severity[rule.severity],
                isActive: rule.is_active,
                isActiveText: ruleCondition.status[rule.is_active],
                message: rule.message,
                reportMethods: reportMethods,
                recipients: rule.recipients,
                otherEmails: req.body.otherEmails,
            },
        });
    } catch (error){
        if (error && error.code == 11000) {
            return res.status(400).send(err.E43003);
        }
        if (error.kind && error.kind === "ObjectId") return res.status(400).send(err.E43008);
        
        return res.status(400).send(err.E40001);
    }
}



//B0004
module.exports.getRuleDetails = async (req, res) => {
    try {
        const ruleId = req.params.id;
        let ruleDetails = await Rule.findById(ruleId).select('-created_at -updated_at -__v');
        if (!ruleDetails) return res.status(400).send(err.E43001);
        // let deviceDetails = await Device.find({_id:{$in: ruleDetails.device}}).select('name code');
        let ruleFieldDetails = await Field.findById(ruleDetails.rule_field).select('name code');
        let ruleOperatorDetails = await Operator.findById(ruleDetails.rule_operator).select('name code description');
        // let userDetails = await User.find({_id:{$in: ruleDetails.recipients}}).select('email name');
        let reportMethods = [];
        if (ruleDetails.email){
            reportMethods.push("email")
        }
        if (ruleDetails.phone){
            reportMethods.push("phone")
        }
        if (ruleDetails.sms){
            reportMethods.push("sms")
        }
        let otherEmails = '';
        ruleDetails.others.forEach(email => {
            otherEmails += `${email},`;
        });
        otherEmails = otherEmails.slice(0,-1);
        res.status(200).send({
            "code": 200,
            "message": "OK",
            "data":{
                id: ruleDetails._id,
                name: ruleDetails.name,
                devices: ruleDetails.device,
                plantId: ruleDetails.plant,
                value: ruleDetails.value,
                ruleType: ruleDetails.rule_type,
                ruleTypeText:ruleCondition.ruleType[ruleDetails.rule_type],
                ruleTime: ruleDetails.rule_time,
                ruleTimeText: ruleCondition.trackingTime[ruleDetails.rule_time],
                ruleField: ruleFieldDetails.code,
                ruleFieldText: ruleFieldDetails.name,
                ruleOperator: ruleOperatorDetails.code,
                ruleOperatorText: ruleOperatorDetails.name,
                severity: ruleDetails.severity,
                severityText: ruleCondition.severity[ruleDetails.severity],
                isActive: ruleDetails.is_active,
                isActiveText: ruleCondition.status[ruleDetails.is_active],
                message: ruleDetails.message,
                reportMethods: reportMethods,
                recipients: ruleDetails.recipients,
                otherEmails: otherEmails,
            },
        })
    } catch (error) {
        if (error.kind && error.kind === "ObjectId") return res.status(400).send(err.E43008);
        res.status(400).send(err.E40001);
    }
}

//B0005
module.exports.getListRule = async (req, res) => {
    try {
        if (validationResult(req).errors.length){
            let groupErr = validationResult(req).errors.reduce(function (groups,err) {
                groups[err.param] = groups[err.param] || [];
                groups[err.param].push(err.msg);
                return groups;
            }, Object.create(null));
            let errCode = err.E43009;
            return res.status(400).send(Object.assign(errCode,{errors: groupErr}));
        };
        const plantId = req.query.plantId;
        let plant = await Plant.findById(plantId);
        if (!plant) return res.status(400).send(err.E43002);
        let {orderBy, sort} = req.query;
        let sorting = {};
        if(orderBy && sort) {sorting[orderBy]=sort};
        let rules = await Rule.find({plant: plantId}, null, {sort:sorting}).select('name enable rule_type rule_time severity is_active');
        rules = rules.map(rule =>{
            return {
                id: rule._id,
                name: rule.name,
                ruleType: rule.rule_type,
                ruleTypeText: ruleCondition.ruleType[rule.rule_type],
                severity: rule.severity,
                severityText: ruleCondition.severity[rule.severity],
                status: rule.is_active,
                statusText: ruleCondition.status[rule.is_active],
                ruleTime: rule.rule_time,
                ruleTimeText: ruleCondition.trackingTime[rule.rule_time],
            }
        })
        res.status(200).send({
            "code": 200,
            "message": "OK",
            "data": rules,
        })

    } catch (error) {
        if (error.kind && error.kind === "ObjectId") return res.status(400).send(err.E43008);
        res.status(400).send(err.E40001);
    }
}

//B0006
module.exports.postUpdate = async (req, res) => {
    try {
      if (validationResult(req).errors.length){
        let groupErr = validationResult(req).errors.reduce(function (groups,err) {
            groups[err.param] = groups[err.param] || [];
            groups[err.param].push(err.msg);
            return groups;
        }, Object.create(null));
        let errCode = err.E43009
        return res.status(400).send(Object.assign(errCode,{errors: groupErr}))
    };
        let dataUpdate = {
            value: req.body.value,
            device: req.body.devices,
            is_active: req.body.isActive,
            message: req.body.message,
            others: ((typeof req.body.otherEmails === 'string' || req.body.otherEmails instanceof String) && req.body.otherEmails.length)
            ? req.body.otherEmails.split(',')
            : [],
            recipients: req.body.recipients,
            email: req.body.reportMethods.includes("email")? 1 : 0,		
            phone: req.body.reportMethods.includes("phone")? 1 : 0,			
            sms: req.body.reportMethods.includes("sms")? 1 : 0,		
            severity: req.body.severity,
            updated_at: Date.now()
        };
        const ruleId= req.params.id;
        
        let rule = await Rule.findById(ruleId).select('rule_type');
        if (!rule) return res.status(400).send(err.E43001);

        if (rule.rule_type === 0) dataUpdate.device = [];

        let device = await Device.find({_id: {$in: req.body.devices}});
        if (device.length !== req.body.devices.length) return res.status(400).send(err.E43010);

        let recipients = await User.find({_id: {$in: req.body.recipients}});
        if (recipients.length !== req.body.recipients.length) return res.status(400).send(err.E43011);

        let updateRule = await Rule.findOneAndUpdate({_id:ruleId}, dataUpdate);
        if (!updateRule) return res.send(err.E43001);
        let ruleDetails = await Rule.findById(ruleId)

        let ruleFieldDetails = await Field.findById(ruleDetails.rule_field).select('name code');
        let ruleOperatorDetails = await Operator.findById(ruleDetails.rule_operator).select('name code description');

        let reportMethods = [];
        if (ruleDetails.email){
            reportMethods.push("email")
        }
        if (ruleDetails.phone){
            reportMethods.push("phone")
        }
        if (ruleDetails.sms){
            reportMethods.push("sms")
        }
        res.status(200).send({
            "code": 200,
            "message": "OK",
            "data": {
                id: ruleDetails._id,
                name: ruleDetails.name,
                devices: ruleDetails.device,
                plantId: ruleDetails.plant,
                value: ruleDetails.value,
                ruleType: ruleDetails.rule_type,
                ruleTypeText:ruleCondition.ruleType[ruleDetails.rule_type],
                ruleTime: ruleDetails.rule_time,
                ruleTimeText: ruleCondition.trackingTime[ruleDetails.rule_time],
                ruleField: ruleFieldDetails.code,
                ruleFieldText: ruleFieldDetails.name,
                ruleOperator: ruleOperatorDetails.code,
                ruleOperatorText: ruleOperatorDetails.name,
                severity: ruleDetails.severity,
                severityText: ruleCondition.severity[ruleDetails.severity],
                isActive: ruleDetails.is_active,
                isActiveText: ruleCondition.status[ruleDetails.is_active],
                message: ruleDetails.message,
                reportMethods: reportMethods,
                recipients: ruleDetails.recipients,
                otherEmails: req.body.otherEmails,
            },
        })
    } catch (error) {
        if (error.kind && error.kind === "ObjectId") return res.status(400).send(err.E43008);
        res.status(400).send(err.E40001);
    }
}

//B0007
module.exports.delete = async (req, res) => {
    try {
        let ruleId= req.params.id;
        let rule = await Rule.findById(ruleId);
        if(!rule) return res.status(400).send(err.E43001);
        let deleteRule = await Rule.findOneAndDelete({_id:ruleId});
        if (!deleteRule) return res.send(err.E43001);
        res.status(200).send({
            "code": 200,
            "message": "OK",
            "data": {
                id: deleteRule._id,
                name: deleteRule.name,
            },
        })
    } catch (error) {
        if (error.kind && error.kind === "ObjectId") return res.status(400).send(err.E43008);
        res.status(400).send(err.E40001);
    }
}


















