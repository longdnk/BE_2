const { transformMRangeWithLabelsReply } = require('@redis/time-series/dist/commands');
const err = require('../common/err');
const httpResponseCode = require('../common/httpResponseCode');
module.exports.catchErrors = (error) => {
    let errMessages = err.E40001;
    let errCode = httpResponseCode.badRequest;

    if (err[error.message]){
      errMessages = err[error.message];
    }
    else if(error.message === 'validationError'){
      errMessages = err.E43009;
    } 
    else if (error.kind === 'ObjectId'){
      errMessages = err.E40023;
    }
    else if (error.code == 11000){
      if(error.keyValue){
        errMessages = {
          code: err.E40017.code,
          message: err.E40017.message + `Key value: ${JSON.stringify(error.keyValue).replaceAll(/\"|{|}/g,"")}`
        }
      }else {
        errMessages = {
          code: err.E40017.code,
          message: err.E40017.message
        };
      }
    }
    return {
      errCode: errCode,
      errMessages: errMessages,
    };
} 

module.exports.groupValidationErr = (errors) => {
  try{
    let groupErr = errors.reduce(function (groups,err) {
      groups[err.param] = groups[err.param] || [];
      groups[err.param].push(err.msg);
      return groups;
    }, Object.create(null));
    return groupErr;
  } catch {
    return []
  }
}

//#region Check data region
module.exports.checkDataType = (fieldValue, dataType) => {
  let isDataTypeValid = false;
  switch (dataType) {
    case 'Object':{
      isDataTypeValid = typeof fieldValue === 'object' && !Array.isArray(fieldValue) && fieldValue !== null
      break;
    }
    case 'Array':{
      isDataTypeValid = Array.isArray(fieldValue) || fieldValue instanceof Array
      break;
    }
    case 'Number':{
      isDataTypeValid = typeof fieldValue === 'number' || fieldValue instanceof Number;
      break;
    }
    case 'String':{
      isDataTypeValid = typeof fieldValue === 'string' || fieldValue instanceof String
      break;
    }
    case 'Boolean':{
      isDataTypeValid = typeof fieldValue === 'boolean'|| fieldValue instanceof Boolean
      break;
    }
  }
  if (isDataTypeValid){
    return true;
  }
  return false;
}

module.exports.checkArrayChildren = (fieldArrayValues,dataType) => {
  let isFieldArray = this.checkDataType(fieldArrayValues,"Array");
  if(!isFieldArray){  
    throw new Error(this.setMsgValidationDataTypeError('Array'))
  }
  let isDataTypeValid = false;
  isDataTypeValid = fieldArrayValues.every(value => {
    return this.checkDataType(value, dataType)
  })
  return isDataTypeValid
}

// module.exports.checkFieldDataType = (fieldValue,dataType) => {
//   if (this.checkDataType(fieldValue,dataType)){
//     return true;
//   }
//   throw new Error(this.setMsgValidationDataTypeError(dataType))
// }


// module.exports.checkLength = (fieldValue,fieldName, min=0, max=255) => {
//   let isFieldArrayOrString = this.checkDataType(fieldValue,"Array") || this.checkDataType(fieldValue,"String");
//   if(!isFieldArrayOrString){  
//     throw new Error(this.setMsgValidationDataTypeError('Array or String'))
//   }
//   let isLengthValid = false;
//   console.log(fieldValue)
//   isLengthValid = (fieldValue.length >= min || fieldValue.length <= max)
//   if (isLengthValid){
//     return true;
//   }
//   throw new Error(this.setMsgValidationRangeValueError(fieldName, min, max))
// }
//#endregion

//#region Set Message
module.exports.setMsgValidationExistError = (fieldName) => {
  return `${fieldName} required!`
}

module.exports.setMsgValidationDataTypeError = (dataTypeName) => {
  return `Type ${dataTypeName} required!`
}

module.exports.setMsgValidationRangeValueError = (fieldName, min=1, max=255) => {
  if (min === max){
    return `${fieldName}'s length must be ${max}!`
  }
  return `${fieldName}'s length must between ${min} and ${max}!`
}

module.exports.setMsgValidationInvalidValueError = (fieldName) => {
  return `Invalid ${fieldName} value!`
}

module.exports.setMsgValidationInvalidChildArrayValueError = (dataTypeName) => {
  return `All array elements must be ${dataTypeName}!`
}
//#endregion