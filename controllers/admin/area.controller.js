const Portfolio = require('../../models/Portfolio.model');
const Site = require('../../models/Site.model');
const {catchErrors} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');

/**UM00006
 * Get all Portfolio and all site inside them
 * @param {*} req 
 * @param {*} res 
 * @returns All Portfolios and all site of them
 */
//UM00006.1
module.exports.listArea = async function (req, res) {
    try {
      let portfolios = await Portfolio.find().select('name code');
      let sitesInPortfo = []

      //Get all sites of a portfolio and show it inside that portfolio
      for (let i =0; i< portfolios.length; i++){
        sitesInPortfo = await Site.find({portfolio: portfolios[i]._id}).select('code name');
        portfolios[i] = {
            _id: portfolios[i]._id,
            code: portfolios[i].code,
            name: portfolios[i].name,
            sites:sitesInPortfo
        }
      }
      return res.status(httpResponseCode.ok).send({
        "code": httpResponseCode.ok,
        "message": "OK",
        "data": portfolios,
        
      });
    } 
    catch (error) {
      return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
  }