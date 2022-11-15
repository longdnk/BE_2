/**
 * Handle tasks in user management 
 */
const User = require('../../models/User.model');
const Portfolio = require('../../models/Portfolio.model');
const Role = require('../../models/Role.model');
const {catchErrors,groupValidationErr} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');
const {validationResult} = require('express-validator');

/** UM0001
 * Get all user in the system
 * @param {} req 
 * @param {} res 
 * @returns Array of users existed in the system
 */
module.exports.getUsers = async function (req, res) {
  try{
    let users = await User.find().select('name email role is_active portfolios sites');
    //Set data as required form in FE
    users = users.map(user =>{
      return{
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        portfolios: user.portfolios,
        sites: user.sites,
      }
    })
    return res.status(httpResponseCode.ok).send({
      "code": httpResponseCode.ok,
      "message": "OK",
      "data": users,
    });
  } catch(error){
    return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
  }
};

/**UM00002
 * Get details of an user
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of all details of user
 */
module.exports.getUserDetail = async function (req, res) {
  const userId = req.params.id;
  try {
    //Check user id valid?
    let user = await User.findOne({ _id: userId }).select('name email role is_active portfolios sites');
    if(!user) {
      throw new Error("E42002");
    }
    return res.status(httpResponseCode.ok).send({
      "code": httpResponseCode.ok,
      "message": "OK",
      "data": {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        portfolios: user.portfolios,
        sites: user.sites,
      }
    });
  } catch(error){
    return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
  }
}

/**UM0004
 * Update detailed Infor of user
 * @param {_id, name, role, portfolios, sites, isActive} req 
 * @param {*} res 
 * @returns Object of new infors of Updated user
 */
module.exports.updateUser = async function(req,res) {
  if (validationResult(req).errors.length){
    let error = new Error('validationError')
    let groupsErr = groupValidationErr(validationResult(req).errors)
    return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
  };
  try{
    let userId = req.params.id;
    let data = {
    name: req.body.name,
    role: req.body.role,
    portfolios: req.body.portfolios,
    sites: req.body.sites,
    is_active: req.body.isActive
  }
    //Check valid userId?
  let user = await User.findOne({ _id: userId });
  if(!user) {
    throw new Error("E42002");
  }
  //Check whether all chosen Sites is in all chosen Portfolios
  let portfolios = await Portfolio.find({_id: {$in: data.portfolios}});
  if(portfolios.length !== data.portfolios.length){
    throw new Error('E42007')
  }

  let sitesOfPortfolio = [];
  portfolios.forEach(portfolio => {
    sitesOfPortfolio.push(portfolio.sites.toString().split(','))
  })
  sitesOfPortfolio = sitesOfPortfolio.flat();
  let checkSitesandPortfolios = data.sites.every(site => sitesOfPortfolio.includes(site))
  if(!checkSitesandPortfolios) {
    throw new Error('E42005');
  }
  //Check valid roles?
  let isRoleExisted = await Role.findOne({name: req.body.role});
  if(!isRoleExisted) {
    throw new Error('E42001')
  }
  let updatedUser = await User.findByIdAndUpdate(userId, data, { 'upsert': true, new: true });
  return res.status(httpResponseCode.ok).send({
    "code": httpResponseCode.ok,
    "message": "OK",
    "data": {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.is_active,
        portfolios: updatedUser.portfolios,
        sites: updatedUser.sites,
    },
  })
  } catch(error){
    return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
  }
}

/**UM0005
 * Delete User Account
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of id and name of deleted Account
 */
module.exports.deleteUser = async function (req, res) {
  try {
    let userId = req.params.id;
    //check valid userId?
    let deletedUser = await User.findOneAndDelete({ _id: userId });
    if (!deletedUser){
      throw new Error('E42002')
    }
    return res.status(httpResponseCode.ok).send({
      "code": httpResponseCode.ok,
      "message": "OK",
      "data": {
        id: deletedUser._id,
        name: deletedUser.name,
    }
    })
  } catch(error){
    return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
  }
};


/**UM00007
 * Create new User
 * @param {_id, name, email, role, portfolios, sites, isActive} req 
 * @param {*} res 
 * @returns Object of detail infor of new User Account
 */
module.exports.createUser = async function (req, res) {
    if (validationResult(req).errors.length){
      let error = new Error('validationError')
      let groupsErr = groupValidationErr(validationResult(req).errors)
      return res.status(catchErrors(error).errCode).send(Object.assign(catchErrors(error).errMessages, {errors: groupsErr}));
    };
    try {
      //Check valid password 
      let pwd = req.body.password.trim()
      if (pwd.length < 3) {
        throw new Error('E40018');
      }
      let sites = req.body.sites;
      let portfolios = req.body.portfolios;

      //Check whether chosen Sites are in all chosen Portfolios
      let sitesOfPortfolio = await Portfolio.find({_id: {$in: portfolios}}).select('sites');
      sitesOfPortfolio = JSON.stringify(sitesOfPortfolio);
      let isSitesInPortfolio = sites.every(siteId => sitesOfPortfolio.includes(siteId));
      if(!isSitesInPortfolio){
        throw new Error('E42005');
      }

      //Check valid role
      let isRoleExisted = await Role.find({name: req.body.role}).select('name');
      if(!isRoleExisted.length){
        throw new Error('E42001');
      }

      const newUser = new User(req.body)
      newUser.role = req.body.role ? req.body.role : "US"
      newUser.password = pwd
      await newUser.save();
      
      // const token = await newUser.generateAuthToken()
      return res.status(httpResponseCode.created).send({
        code: httpResponseCode.created,
        message: "OK",
        data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.is_active,
        portfolios: newUser.portfolios,
        sites: newUser.sites,
        }
      }) 
    } catch(error){
      return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
};

/**UM00008
 * Get data of sample User
 * @param {userId} req 
 * @param {*} res 
 * @returns Object of data of sample user
 */
module.exports.duplicateUser = async function (req, res) {
  const userId = req.params.id;
  try {
    //Check valid userId
    let sampleUser = await User.findOne({ _id: userId });
    if (!sampleUser){
      throw new Error('E42002')
    }
    return res.status(httpResponseCode.ok).send({
      "code": httpResponseCode.ok,
      "message": "OK",
      "data": {
          name: "",
          email:"",
          role:"",
          portfolios: sampleUser.portfolios,
          sites: sampleUser.sites,
      }
    });
  } catch (error) {
    return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
  }
}