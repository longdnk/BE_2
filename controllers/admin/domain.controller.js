const Domain = require('../../models/Domain.model')
const err = require('../../common/err')
const success = require('../../common/success')
module.exports.getList = async (req, res ) => {
    try {
        domainList = await Domain.find({})
        res.status(200).send({code:200, message:'OK', data: domainList})
    } catch (err) {
        res.status(400).send({result: 0, err})
    }
}

module.exports.postAdd = async function(req, res) {
	//Create a new station
  try {
    const domain = new Domain(req.body)
    const isCheck = await Domain.find({name: domain.name})
    if (isCheck.length) return res.status(400).send(err.E42000)
    await domain.save()
    res.status(200).send({suceess: success.S20001, data: domain})
  } catch (error) {
    res.status(400).send({"result": 0, error})
  }
};
