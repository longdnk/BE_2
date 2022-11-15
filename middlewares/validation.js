const {body,query} = require('express-validator');
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const {setMsgValidationExistError,
    setMsgValidationDataTypeError,
    setMsgValidationRangeValueError,
    setMsgValidationInvalidValueError,
    setMsgValidationInvalidChildArrayValueError,
    checkDataType,
    checkArrayChildren} = require('../helpers/errorCatching');
const validate = method => {
    try{
        switch (method){
            case 'createRule':{
                return [
                    body('value')
                        .exists({checkNull: true})
                        .withMessage('Condition Value Required!')
                        .isNumeric()
                        .not().isArray()
                        .withMessage('Number only'),

                    body('plantId')
                        .exists({checkNull: true})
                        .not().isEmpty()
                        .withMessage('Plant ID Required!')
                        .isString()
                        .withMessage('Type string required'),

                    body('ruleType')
                        .exists({checkNull: true})
                        .not().isEmpty()
                        .withMessage('Type code required')
                        .isIn(["1","0"])
                        .withMessage('Invalid rule type code'),

                    body('devices')
                        .exists({checkNull: true})
                        // .not().isEmpty()
                        .withMessage('Devices required')
                        .isArray({max: 255})
                        .withMessage('Invalid Type')
                        .custom(paras => {
                            if (Array.isArray(paras)){
                                let check = paras.every(para =>{
                                    return typeof para === 'string' || para instanceof String
                                })
                                if (check) return true;
                                throw new Error("Invalid data type");
                            }
                        })
                        .if(body('ruleType').isIn([1]))
                        .custom(paras => {
                            if (Array.isArray(paras) && paras.length!==0){
                                return true;
                            }
                            throw new Error('Choose at least one device');
                        }),
                        
                        
                    body('ruleField')
                        .exists({checkNull: true})
                        .not().isEmpty()
                        .withMessage('Field code required')
                        .isString()
                        .withMessage('Type string required'),

                    body('ruleOperator')
                        .exists({checkNull: true})
                        .not().isEmpty()
                        .withMessage('Operator code required')
                        .isString()
                        .withMessage('Type string required'),
                    
                    body('name')
                        .exists({checkNull: true})
                        .not().isEmpty()
                        .withMessage('Rule name required')
                        .isString()
                        .withMessage('Type string required')
                        .isLength({max:255})
                        .withMessage('Invalid rule name length'),

                    body('ruleTime')
                        .exists({checkNull: true})
                        .not().isEmpty()
                        .withMessage('Rule time required')
                        .isIn(["RT","EOD"])
                        .withMessage('Invalid rule time code'),

                    body('isActive')
                        .exists({checkNull: true})
                        .not().isEmpty()
                        .withMessage('Active code required')
                        .isIn(['0','1'])
                        .withMessage('Invalid active code'),
                    
                    body('message')
                        .optional({ nullable: true })
                        .isString()
                        .withMessage('Type string required')
                        .isLength({max: 255})
                        .withMessage('Invalid message length'),

                    body('otherEmails')
                        .optional({ nullable: true })
                        .isString({max: 255})
                        .withMessage('Type string required')
                        .custom(paras => {
                            if(paras === ""){
                                return true
                            }
                            if ((typeof paras === 'string' || paras instanceof String) && paras.length!==0){
                                arrayParas = paras.split(',')
                                let check = arrayParas.every(para =>{
                                    return emailRegexp.test(para)
                                })
                                if (check) return true;
                                throw new Error("Invalid Email(s)")     
                            }
                        }),

                    body('recipients')
                        .exists({checkNull: true})
                        // .not().isEmpty()
                        .withMessage('Recipients required')
                        .isArray({max: 255})
                        .withMessage('Invalid data type')
                        .custom(paras => {
                            if (Array.isArray(paras)){
                                let check = paras.every(para =>{
                                return typeof para === 'string' || para instanceof String
                                })
                            if (check) return true;
                            throw new Error("Invalid data Type")
                            }   
                        }),
                    
                    body('severity')
                        .exists({checkNull: true})
                        .not().isEmpty()
                        .withMessage('Severity required')
                        .isIn(["120","110","100"])
                        .withMessage('Invalid severity code'),
                        
                    body('reportMethods')
                        .exists({checkNull: true})
                        .isArray({max: 255})
                        .withMessage('Invalid data type')
                        .custom(paras => {
                            if (Array.isArray(paras)){
                                let check = paras.every(para =>{
                                return ["email", "phone", "sms"].includes(para)
                                })
                            if (check) return true;
                            throw new Error("Invalid Method")
                            }
                        }),
                   ]  
            }
            case 'listAllRules':{
                return [
                    query('plantId')
                        .exists({checkNull: true})
                        .not().isEmpty()
                        .withMessage('Plant ID Required!')
                        .isString()
                        .withMessage('Type string required'),

                    query('orderBy')
                        .optional({ nullable: true })
                        .isIn(["name","severity","rule_type"])
                        .withMessage('Invalid severity code'),
                    
                    query('sort')
                        .optional({ nullable: true })
                        .isIn(["asc","desc"])
                        .withMessage('Invalid severity code'),
                ]
            }
            case 'updateRule':{
                return [
                    body('value')
                        .exists({checkNull: true})
                        .withMessage('Condition Value Required!')
                        .isNumeric()
                        .not().isArray()
                        .withMessage('Number only'),

                    body('devices')
                        .exists({checkNull: true})
                        // .not().isEmpty()
                        .withMessage('Devices required')
                        .isArray({max: 255})
                        .withMessage('Invalid Type')
                        .custom(paras => {
                            if (Array.isArray(paras)){
                                let check = paras.every(para =>{
                                    return typeof para === 'string' || para instanceof String
                                })
                                if (check) return true;
                                throw new Error("Invalid data type");
                            }
                        })
                        .if(body('ruleType').isIn([1]))
                        .custom(paras => {
                            if (Array.isArray(paras) && paras.length!==0){
                                return true;
                            }
                            throw new Error('Choose at least one device');
                        }),

                    body('isActive')
                        .exists({checkNull: true})
                        .not().isEmpty()
                        .withMessage('Active code required')
                        .isIn(['0','1'])
                        .withMessage('Invalid active code'),
                    
                    body('message')
                        .optional({ nullable: true })
                        .isString()
                        .withMessage('Type string required')
                        .isLength({max: 255})
                        .withMessage('Invalid message length'),

                    body('otherEmails')
                        .optional({ nullable: true })
                        .isString({max: 255})
                        .withMessage('Type string required')
                        .custom(paras => {
                            if(paras === ""){
                                return true
                            }
                            if ((typeof paras === 'string' || paras instanceof String) && paras.length!==0){
                                arrayParas = paras.split(',')
                                let check = arrayParas.every(para =>{
                                    return emailRegexp.test(para)
                                })
                                if (check) return true;
                                throw new Error("Invalid Email(s)")     
                            }
                        }),

                    body('recipients')
                        .exists({checkNull: true})
                        // .not().isEmpty()
                        .withMessage('Recipients required')
                        .isArray({max: 255})
                        .withMessage('Invalid data type')
                        .custom(paras => {
                            if (Array.isArray(paras)){
                                let check = paras.every(para =>{
                                return typeof para === 'string' || para instanceof String
                                })
                            if (check) return true;
                            throw new Error("Invalid data Type")
                            }   
                        }),
                    
                    body('severity')
                        .exists({checkNull: true})
                        .not().isEmpty()
                        .withMessage('Severity required')
                        .isIn(["120","110","100"])
                        .withMessage('Invalid severity code'),
                    
                    body('reportMethods')
                        .exists({checkNull: true})
                        .isArray({max: 255})
                        .withMessage('Invalid data type')
                        .custom(paras => {
                            if (Array.isArray(paras)){
                                let check = paras.every(para =>{
                                return ["email", "phone", "sms"].includes(para)
                                })
                            if (check) return true;
                            throw new Error("Invalid Method")
                            }
                        }),
                   ]  
            }
        }
    } catch (err) {
        console.log(err);
    }
}

const adminValidate = method => {
    let validationSyntax = [];
    try{
        switch (method){
            //#region  IOT
            case 'createIot':{
                validationSyntax.push(
                    body('code')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('IOT Code'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('IOT Code', 1, 255)),
                )                    
            }
            case 'updateIot':{
                validationSyntax.push(                
                    body('name')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('IOT Name'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('IOT Name', 1, 255)),
                )
                break;
            }
            //#endregion
            
            //#region Protocol
            case 'createProtocol':
            case 'updateProtocol':{
                validationSyntax.push(                    
                    body('name')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Protocol Name'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('Protocol Name', 1, 255)),

                    body('parasInfor')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Paras Infor'))
                        .isArray()
                        .withMessage(setMsgValidationDataTypeError('Array'))
                        .isLength({min:0, max:100})
                        .withMessage(setMsgValidationRangeValueError('Inverter Config', 0, 100))
                        .if(body('parasInfor').isArray())
                        .custom(paras => {
                            let isChildrenDataTypeValid = checkArrayChildren(paras, 'String')
                            if (isChildrenDataTypeValid){
                                return true;
                            }
                            throw new Error(setMsgValidationInvalidChildArrayValueError('String'))
                        }),
                        
                    body('parasConfig')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Paras Config'))
                        .isArray()
                        .withMessage(setMsgValidationDataTypeError('Array'))
                        .isLength({min:0, max:100})
                        .withMessage(setMsgValidationRangeValueError('Inverter Config', 0, 100))
                        .if(body('parasConfig').isArray())
                        .custom(paras => {
                            let isChildrenDataTypeValid = checkArrayChildren(paras, 'String')
                            if (isChildrenDataTypeValid){
                                return true;
                            }
                            throw new Error(setMsgValidationInvalidChildArrayValueError('String'))
                        }),
                    
                    body('parasTag')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Paras Tags'))
                        .isArray()
                        .withMessage(setMsgValidationDataTypeError('Array'))
                        .isLength({min:0, max:100})
                        .withMessage(setMsgValidationRangeValueError('Inverter Config', 0, 100))
                        .if(body('parasTag').isArray())
                        .custom(paras => {
                            let isChildrenDataTypeValid = checkArrayChildren(paras, 'String')
                            if (isChildrenDataTypeValid){
                                return true;
                            }
                            throw new Error(setMsgValidationInvalidChildArrayValueError('String'))
                        }),

                    body('dataType')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Data Type'))
                        .isArray()
                        .withMessage(setMsgValidationDataTypeError('Array'))
                        .isLength({min:0, max:100})
                        .withMessage(setMsgValidationRangeValueError('Inverter Config', 0, 100))
                        .if(body('dataType').isArray())
                        .custom(paras => {
                            let isChildrenDataTypeValid = checkArrayChildren(paras, 'String')
                            if (isChildrenDataTypeValid){
                                return true;
                            }
                            throw new Error(setMsgValidationInvalidChildArrayValueError('String'))
                        }),
                )
                break;
            }
            //#endregion
            
            //#region Inverter
            case 'getUpdateConfig':{
                validationSyntax.push(
                    query('configIndex')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Config Index'))
                        .isNumeric()
                        .withMessage(setMsgValidationDataTypeError('Number'))
                )
                break;
            }
            case 'createInverter':
            case 'updateInverter':{
                validationSyntax.push(
                    body('name')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Inverter Name'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('Inverter Name', 1, 255)),

                    body('protocolId')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Inverter Name'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String')),

                    body('producer')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Inverter Producer'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Inverter Producer', 0, 255)),


                    body('power')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Inverter Power'))
                        .custom(paras => {
                            let isDataTypeValid = checkDataType(paras, 'Number')
                            if(isDataTypeValid){
                                return true
                            }
                            throw new Error(setMsgValidationDataTypeError('Number'))
                        }),

                    body('stringNum')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Inverter StringNum'))
                        .custom(paras => {
                            let isDataTypeValid = checkDataType(paras, 'Number')
                            if(isDataTypeValid){
                                return true
                            }
                            throw new Error(setMsgValidationDataTypeError('Number'))
                        }),
                )
            }
            case 'updateConfig':
            case 'deleteConfig':
            case 'updateConfig':{
                    validationSyntax.push(
                        body('config')
                            .exists({checkNull: true})
                            .withMessage(setMsgValidationExistError('Inverter Config'))
                            .isArray()
                            .withMessage(setMsgValidationDataTypeError('Array'))
                            .isLength({min:0, max:100})
                            .withMessage(setMsgValidationRangeValueError('Inverter Config', 0, 100))
                            .if(body('config').isArray())
                            .custom(paras => {
                                let isChildrenDataTypeValid = checkArrayChildren(paras, 'Object')
                                if (isChildrenDataTypeValid){
                                    return true;
                                }
                                throw new Error(setMsgValidationInvalidChildArrayValueError('Object'))
                            }),
                    )
                break;
            }
            //#endregion

            //#region Solar Panel
            case 'createPanel':
            case 'updatePanel':{
                validationSyntax.push(
                    body('name')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Solar Panel Name'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('Solar Panel Name', 1, 255)),

                    body('producer')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Solar Panel Producer'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Solar Panel Producer', 0, 255)),


                    body('power')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Solar Panel Power'))
                        .custom(paras => {
                            let isDataTypeValid = checkDataType(paras, 'Number')
                            if(isDataTypeValid){
                                return true
                            }
                            throw new Error(setMsgValidationDataTypeError('Number'))
                        }),
                )
                break;
            }
            //#endregion

            //#region User
            case 'createUser': {
                validationSyntax.push(
                    body('email')
                    .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Email'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String')) //Set ["email@gmail.com"] case fail
                        .isEmail()
                        .withMessage(setMsgValidationDataTypeError('Email'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('Email', 1, 255)),
                )
            }
            case 'updateUser':{
                validationSyntax.push(                    
                    body('name')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('User name'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('User name', 1, 255)),

                    body('role')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Role'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('Role', 1, 255)),

                    body('portfolios')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Portfolios'))
                        .isArray()
                        .withMessage(setMsgValidationDataTypeError('Array'))
                        .isLength({min:0, max:100})
                        .withMessage(setMsgValidationRangeValueError('Porfolios', 0, 100)),

                    body('sites')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Sites'))
                        .isArray()
                        .withMessage(setMsgValidationDataTypeError('Array'))
                        .isLength({min:0, max:100})
                        .withMessage(setMsgValidationRangeValueError('Sites', 0, 100)),
                        
                    body('isActive')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('IsActive status'))
                        .isIn([0,1])
                        .withMessage(setMsgValidationInvalidValueError('IsActive status'))
                )
                break;
            }
            //#endregion

            //#region Role
            case 'createRole': {
                validationSyntax.push(
                    body('name')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Role name'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('Role name', 1, 255)),
                )
            }
            case 'updateRole':{
                validationSyntax.push(                    
                    body('description')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Description'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Description', 0, 255)),

                    body('permissions')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Permissions'))
                        .isArray()
                        .withMessage(setMsgValidationDataTypeError('Array'))
                        .isLength({min:0, max:100})
                        .withMessage(setMsgValidationRangeValueError('Permissions', 0, 100)),
                )
                break;
            }
            //#endregion

            //#region Permission
            case 'createPermission': 
            case 'updatePermission':{
                validationSyntax.push(                    
                    body('name')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Permission Name'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('Permission Name', 1, 255)),

                    body('route')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Route'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('Route', 1, 255)),
                )
                break;
            }
            //#endregion

            //#region Supplier
            case 'updateSupplier':
            case 'createSupplier':{
                validationSyntax.push(
                    body('name')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Supplier Name'))
                        .isString() 
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('Supplier Name', 1, 255)),

                    body('group')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Supplier Group'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Supplier Group', 0, 255)),

                    body('address')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Supplier Address'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Supplier Address', 0, 255)),

                    body('taxNumber')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Supplier taxNumber'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .if(body('taxNumber').not().isEmpty())
                        .isLength({min:14, max:14})
                        .withMessage(setMsgValidationDataTypeError('Tax Number ID')),

                    body('code')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Supplier Code'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Supplier Code', 0, 255)),
                    
                    body('isActive')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('IsActive status'))
                        .isIn([0,1])
                        .withMessage(setMsgValidationInvalidValueError('IsActive status')),

                        body('contact')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Supplier Contact'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Supplier Contact', 0, 255)),    
                        )
                        break;
                    }
            //#endregion

            //#region Customer
            case 'updateCustomer':
            case 'createCustomer':{
                validationSyntax.push(
                    body('name')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Customer Name'))
                        .isString() 
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('Customer Name', 1, 255)),

                    body('address')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Customer Address'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Customer Address', 0, 255)),

                    body('phone')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Customer Phone'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .if(body('phone').not().isEmpty())
                        .isLength({min:10, max:11})
                        .withMessage(setMsgValidationRangeValueError('Phone Number', 10, 11)),

                    body('taxNumber')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Customer taxNumber'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .if(body('taxNumber').not().isEmpty())
                        .isLength({min:14, max:14})
                        .withMessage(setMsgValidationDataTypeError('Tax Number')),

                    body('code')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Customer Code'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Customer Code', 0, 255)),

                    body('email')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Email'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String')) //Set ["email@gmail.com"] case fail
                        .isEmail()
                        .withMessage(setMsgValidationDataTypeError('Email'))
                        .isLength({min:1, max:255})
                        .withMessage(setMsgValidationRangeValueError('Email', 1, 255)),
                    
                    body('addressUse')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Address Use'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Address Use', 0, 255)),

                    body('purpose')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Purpose'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Purpose', 0, 255)),
                        
                    body('type')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('Type'))
                        .isString()
                        .withMessage(setMsgValidationDataTypeError('String'))
                        .isLength({min:0, max:255})
                        .withMessage(setMsgValidationRangeValueError('Type', 0, 255)),
                    
                    body('isActive')
                        .exists({checkNull: true})
                        .withMessage(setMsgValidationExistError('IsActive status'))
                        .isIn([0,1])
                        .withMessage(setMsgValidationInvalidValueError('IsActive status')),   
                )
            break;
            }
            //#endregion
        }
        return validationSyntax;
    } catch (err) {
        console.log(err);
    }
}

module.exports = {validate,adminValidate};