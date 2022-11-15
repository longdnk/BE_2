const jwt = require('jsonwebtoken')
const User = require('../models/User.model')
const err = require('../common/err')

const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer', '').trim()
        const data = jwt.verify(token, process.env.JWT_KEY)
        //const user = await User.findOne({ _id: data._id, 'tokens.token': token }) login 1 thiet bi

        const user = await User.findOne({ _id: data._id})
        if (!user) {
            throw new Error()
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send(err.E40019)
    }
}
module.exports = auth
