const Site = require('../../models/Site.model');
const Plant = require('../../models/Plant.model');
const Portfolio = require('../../models/Portfolio.model');
const {getCodeOfNextElement} = require('../../helpers/commonHelpers');
const httpResponseCode = require('../../common/httpResponseCode');
const {catchErrors} = require('../../helpers/errorCatching');
const portfolio = require('../../models/Portfolio.model');

/**SC00002
 * Get detailed infor of site
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of site
 */
module.exports.getSiteDetails = async(req,res) => {
    try{
        const siteId = req.params.id;
        let site = await Site.findById(siteId).select('code name portfolio plants');
        if(!site) {
            throw new Error('E42007')
        };
        let portfolio = await Portfolio.findById(site.portfolio).select('name code');
        let plant = await Plant.find({_id:{$in:site.plants}}).select('name code');
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: site._id,
                code: site.code,
                name: site.name,
                portfolios: portfolio,
                plants: plant,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**SC00003
 * Get condition before create new site
 * @param {*} req 
 * @param {*} res 
 * @returns Object of available Portfolios and plant and next Code
 */
module.exports.getSiteCondition = async(req,res) => {
    try{
        let lastSite = await Site.find().limit(1).sort({$natural:-1}).select('code');
        let code = 'SI00001'
        if(lastSite.length){
            code = getCodeOfNextElement(lastSite[0].code)
        }
        let portfolioList = await Portfolio.find().select('name code');
        let availablePlants = await Plant.find({site: {$eq:null}}).select('name code');
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                nextCode: code,
                portfolios: portfolioList,
                availablePlants: availablePlants,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**SC00004
 * Add new site
 * @param {name code portfolio plants[]} req 
 * @param {*} res 
 * @returns Object of detailed infor of new site
 */
module.exports.postAddSite = async(req,res) => {
    try{
        let portfolio = await Portfolio.findById(req.body.portfolio);
        let plants = await Plant.find({_id:{$in:req.body.plants}});
        if (!portfolio || plants.length !== req.body.plants.length) {
            throw new Error('E42007');
        };
        let isPlantAssignedYet = plants.every(plant => plant.site === null);
        if (!isPlantAssignedYet) {
            throw new Error('E42008');
        }
        let newSite = new Site(req.body);
        await newSite.save();
        await Plant.updateMany({_id:{$in:req.body.plants}},{$set:{site:newSite._id}});
        await Portfolio.updateOne({_id:req.body.portfolio},{$push: {sites: newSite._id}})
        return res.status(httpResponseCode.created).send({
            code:httpResponseCode.created, 
            message:'OK', 
            data: {
                _id: newSite._id,
                name: newSite.name,
                code: newSite.code,
                portfolio: newSite.portfolio,
                plants: newSite.plants,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}


/**SC00006
 * Update site
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated site
 */
module.exports.postUpdateSite = async(req,res) => {
    try{
        let siteId = req.params.id;
        let updatedSite = await Site.findByIdAndUpdate(siteId, {name: req.body.name}, {new: true});
        if(!updatedSite) {
            throw new Error('E42007')
        };
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: updatedSite._id,
                name: updatedSite.name,
                code: updatedSite.code,
                portfolio: updatedSite.portfolio,
                plants: updatedSite.plants,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**SC00008
 * Asign new Plants into Site
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated site and added Plants
 */
module.exports.assignPlants = async(req,res) => {
    try{
        let siteId = req.params.id;
        let plants = await Plant.find({_id:{$in:req.body.plants}});
        if (plants.length !== req.body.plants.length) {
            throw new Error('E42007')
        }
        let isPlantAssignedYet = plants.every(plant => plant.site === null);
        if (!isPlantAssignedYet) {
            throw new Error('E42008')
        }
        let updatedSite = await Site.findByIdAndUpdate(siteId,{$push:{plants: req.body.plants}}, {new: true});
        await Plant.updateMany({_id:{$in:req.body.plants}},{site:siteId});
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                updatedSite:{
                    _id: updatedSite._id,
                    name: updatedSite.name,
                    code: updatedSite.code,
                    portfolio: updatedSite.portfolio,
                    plants: updatedSite.plants,
                },
                addedPlants: req.body.plants
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**SC0010
 * Remove plants from site
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated site and removed Plants
 */
module.exports.removePlants = async (req,res) => {
    try{
        let siteId = req.params.id;
        let plantsInSite = await Site.findById(siteId).select('plants');
        if (!plantsInSite) {
            throw new Error('E42007')
        };
        if (!req.body.plants.every(site => plantsInSite.plants.includes(site))) {
            throw new Error('E42008')
        };
        let updatedSite = await Site.findByIdAndUpdate(siteId,{$pullAll:{plants: req.body.plants}}, {new: true});
        await Plant.updateMany({_id:{$in:req.body.plants}},{site:null});
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                updatedSite:{
                    _id: updatedSite._id,
                    name: updatedSite.name,
                    code: updatedSite.code,
                    portfolio: updatedSite.portfolio,
                    plants: updatedSite.plants,
                },
                removedPlants: req.body.plants
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**SC0011
 * Delete Site
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of deleted site
 */
module.exports.delete = async (req,res) => {
    try{
        let id = req.params.id;
        let site = await Site.findById(id).select('code name portfolio plants');
        if (!site) {
            throw new Error('E42007');
        };
        if (site.plants.length) {
            throw new Error('E42009');
        };
        await Site.deleteOne({_id:id});
        await Portfolio.updateOne({_id:site.portfolio},{$pull: {sites: site._id}})
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: site._id,
                name: site.name,
                code: site.code,
                portfolio: site.portfolio,
                plants: site.plants,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}