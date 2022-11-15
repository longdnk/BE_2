const User = require('../../models/User.model')
const Portfolio = require('../../models/Portfolio.model')
const Role = require('../../models/Role.model')
const Permission = require('../../models/Permission.model')
const err = require('../../common/err')
const { AddPortfolio } = require("../admin/user.controller");


module.exports.postLogin = async function (req, res) {

  try {
    const { email, password } = req.body
    const user = await User.findByCredentials(email, password)

    if (user && user.code == 1) { //user
      return res.status(401).send(err.E40020)
    }

    if (user && user.code == 2) { //password
      return res.status(401).send(err.E40021)
    }

    if (!user) {
      return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
    }
    const token = await user.generateAuthToken()

    //console.log(token)
    user.tokens = user.tokens.filter((tk) => {
      return tk.token == token
    })
    await user.save()
    const role = user.role

    const portfolioId = user.portfolios[0].valueOf()

    // Find Portfolios
    const portfolio = await Portfolio.findOne({ _id: portfolioId })

    let permissionList = []

    if (role === 'SA') {
      permissionList = await Permission.find({})
      permissionList = permissionList.map(permission => {
        return permission = (({ _id, name, route }) => ({ _id, name, route }))(permission);
      })
    } else {
      let permissions = (await Role.find({ name: role }))[0].permissions
      for (let i = 0; i < permissions.length; i++) {
        let permission = await Permission.findById({ _id: permissions[i].valueOf() })
        permission = (({ _id, name, route }) => ({ _id, name, route }))(permission);
        permissionList.push(permission)
      }
    }
    let jsonUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      portfolio: {
        "id": portfolio._id,
        "name": portfolio.name,
        "logoUrl": portfolio.avata_path
      }
    }
    const dataSend = {
      "code": 200,
      "message": "Login successed",
      "data": jsonUser,
      "meta": {
        token: token,
        role: role,
        permissions: permissionList
      }
    }
    res.status(200).send(dataSend)
  } catch (error) {
    res.status(400).send(err.E40001)
  }
};
// Update Login with multy Portfolio
module.exports.postLoginNew = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findByCredentials(email, password)

    if (user && user.code == 1) { //user
      return res.status(401).send(err.E40020)
    }

    if (user && user.code == 2) { //password
      return res.status(401).send(err.E40021)
    }

    if (!user) {
      return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
    }
    const token = await user.generateAuthToken()

    //console.log(token)
    user.tokens = user.tokens.filter((tk) => {
      return tk.token == token
    })
    await user.save()
    const role = user.role

    // Find Portfolios by User
    let portfolios = []
    for (let i = 0; i < user.portfolios.length; i++) {
      const portfolioId = user.portfolios[i].valueOf()
      const portfolio = await Portfolio.findOne({ _id: portfolioId })
      const p = {
        "id": portfolio._id,
        "name": portfolio.name,
        "logoUrl": null
      }
      portfolios.push(p)
    }
    
    let permissionList = []

    if (role === 'SA') {
      permissionList = await Permission.find({})
      permissionList = permissionList.map(permission => {
        return permission = (({ _id, name, route }) => ({ _id, name, route }))(permission);
      })
    } else {
      let permissions = (await Role.find({ name: role }))[0].permissions
      for (let i = 0; i < permissions.length; i++) {
        let permission = await Permission.findById({ _id: permissions[i].valueOf() })
        permission = (({ _id, name, route }) => ({ _id, name, route }))(permission);
        permissionList.push(permission)
      }
    }
    let jsonUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      portfolios: portfolios
    }
    const dataSend = {
      "code": 200,
      "message": "Login successed",
      "data": jsonUser,
      "meta": {
        token: token,
        role: role,
        permissions: permissionList
      }
    }
    res.status(200).send(dataSend)
  } catch (error) {
    res.status(400).send(err.E40001)
  }
}

module.exports.getMe = async function (req, res) {
  //Login a registered user
  res.status(200).send({ code: 200, message: 'get infor successed', 'data': req.user })
};

module.exports.getLogout = async function (req, res) {
  // Log user out of all devices
  try {
    req.user.tokens.splice(0, req.user.tokens.length)
    await req.user.save()
    res.status(200).send({ code: 200, message: 'logout successed', data: req.user })
  } catch (error) {
    res.status(500).send(error)
  }
};

// module.exports.delete = async function(req, res) {
// 	// Delete user
//   try{
//     let user_id = req.body.user_id;

//     let result = await User.findOneAndDelete({ _id: user_id })
//     if (result) {
//       let d = {
//         id: result._id,
//         name: result.name,
//         email: result.email,
//         role: result.role
//       }
//       res.status(200).send({deleted: d})
//       return
//     }
//     res.send(err.E40400)
//   } catch (error) {
//       res.status(400).send({error: error.message})
//   }
// };

module.exports.getEdit = async function (req, res) {
  try {
    //var id = req.params.id;
    let id = req.query.id;
    let user = await User.findById(id)
    if (!user) {
      res.send(err.E40400)
      return
    }
    res.status(200).send({ code: 200, message: 'get infor successed', data: user })

  } catch (error) {
    if (error && error.code == 11000) {
      res.status(400).send(err.E40017)
      return
    }
    res.status(400).send(err.E40001)
  }

};

module.exports.postEdit = async function (req, res) {
  try {
    let id = req.query.id;

    var data = {
      //"id" : req.body.id,
      "name": req.body.name,
      "email": req.body.email,
      "role": req.body.role,
      "is_active": req.body.is_active,
    }
    let query = { _id: id }
    let user_edited = await User.findOneAndUpdate(query, data, { 'upsert': true, returnOriginal: false })
    //console.log(user_edited)
    res.status(200).send({ code: 200, message: 'edit successed', data: user_edited })
  } catch (error) {
    console.log(error)
    if (error && error.code == 11000) {
      res.status(400).send(err.E40017)
      return
    }
    res.status(400).send({ ...err.E40001, ...{ 'description': error.message } })
  }


};