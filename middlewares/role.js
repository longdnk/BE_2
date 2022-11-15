
// function HasRole(roleArray) {
//   return function(req, res, next) {
//     const authorized = false;
// //if user has a role that is required to access any API
//   rolesArray.forEach(role => {
//    authorized = req.user.role === role;
//   })
//   if(authorized) {
//     return next();
//   }
//   return res.status(401).json({
//     result: false,
//     message: 'Unauthorized',
//   })
//   }
// }
const err = require('../common/err')

const user_role = (roleArray) => (req, res, next) => {
  roleArray.forEach(role => {
   authorized = req.user.role.toUpperCase() === role.toUpperCase();
  })

  if(authorized) {
    return next();
  }
  return res.status(401).json(err.E40022)

  return next();
}


module.exports = user_role
