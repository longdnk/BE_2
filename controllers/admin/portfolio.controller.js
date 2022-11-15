const Portfolio = require('../../models/Portfolio.model');
const Site = require('../../models/Site.model');
const Plant = require('../../models/Plant.model');
const Domain = require('../../models/Domain.model');
const {catchErrors} = require('../../helpers/errorCatching');
const httpResponseCode = require('../../common/httpResponseCode');
const {getCodeOfNextElement} = require('../../helpers/commonHelpers');
const domain = require('../../models/Domain.model');
const site = require('../../models/Site.model');


/**PC00001
 * Get all portfolios
 * @param {*} req 
 * @param {*} res 
 * @returns Array of portfolios
 */
module.exports.getPortfolios = async(req,res) => {
    try{
        let portfolios = await Portfolio.find().select('code name').sort({ name: 1 });
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            portfolios: portfolios,
        });
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PC00002
 * Get detailed infor of portfolio
 * @param {*} req 
 * @param {*} res 
 * @returns Object of detailed infor of portfolio
 */
module.exports.getDetailPortfolio = async(req,res) => {
    try{
        const id = req.params.id;
        let portfolioInfor = await Portfolio.findById(id).select('code name domain sites');
        if(!portfolioInfor) {
            throw new Error('E40001')
        };
        let domainInfor = await Domain.findById(portfolioInfor.domain).select('name code');
        let sites = await Site.find({_id:{$in:portfolioInfor.sites}}).select('name code');
        sites = JSON.parse(JSON.stringify(sites));
        for(let i=0; i<sites.length; i++){
            sites[i].plants = await Plant.find({site: sites[i]._id}).select('code name');
        }
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                portfolio:{
                    "_id": portfolioInfor._id,
                    "code": portfolioInfor.code,
                    "name": portfolioInfor.name,
                    "domain": domainInfor,
                    "sites": sites,
                }
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PC00003
 * Get all condition before create new portfolio
 * @param {*} req 
 * @param {*} res 
 * @returns Object of next code, domains and available sites
 */
module.exports.getPortfolioCondition = async(req,res) => {
    try{
        let lastPortfolio = await Portfolio.find().limit(1).sort({$natural:-1}).select('code');
        let code = 'PO00001'
        if(lastPortfolio.length){
            code = getCodeOfNextElement(lastPortfolio[0].code)
        }
        let domainList = await Domain.find().select('name code');
        let availableSites = await Site.find({portfolio: {$eq:null}}).select('name code');
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                nextCode: code,
                domains: domainList,
                availableSites: availableSites,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PC00004
 * Add new portfolio
 * @param {name code domain sites} req 
 * @param {*} res 
 * @returns Object of detailed infor of new portfolio
 */
module.exports.postAddPortfolios = async(req,res) => {
    try{
        let isDomainExist = await Domain.findById(req.body.domain); 
        let sites = await Site.find({_id:{$in:req.body.sites}}); 
        if (!isDomainExist || sites.length !== req.body.sites.length) {
            throw new Error('E42007')
        };
        let isSiteAssignedYet = sites.every(site => site.portfolio === null);
        if (!isSiteAssignedYet) {
            throw new Error('E42008')
        };
        let newPortfolio = new Portfolio(req.body);
        await newPortfolio.save();
        await Site.updateMany({_id:{$in:req.body.sites}},{$set:{portfolio:newPortfolio._id}});
        await Domain.updateOne({_id:req.body.domain}, {$push: {portfolio: newPortfolio.id}});
        return res.status(httpResponseCode.created).send({
            code:httpResponseCode.created, 
            message:'OK', 
            data: {
                _id: newPortfolio._id,
                code: newPortfolio.code,
                name: newPortfolio.name,
                domain: newPortfolio.domain,
                sites: newPortfolio.sites,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PC00006
 * Update portfolio
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated portfolio
 */
module.exports.postUpdatePortfolio = async(req,res) => {
    try{
        let portfolioId = req.params.id;
        let updatedPortfolio = await Portfolio.findByIdAndUpdate(portfolioId, {name: req.body.name}, {new: true});
        if(!updatedPortfolio) {
            throw new Error('E42007')
        };
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: updatedPortfolio._id,
                code: updatedPortfolio.code,
                name: updatedPortfolio.name,
                domain: updatedPortfolio.domain,
                sites: updatedPortfolio.sites,
            }
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

/**PC00008
 * Assign new site into portfolios
 * @param {_id} req 
 * @param {*} res 
 * @returns Object f detailed infor of updated portfolio and added sites
 */
module.exports.assignSites = async(req,res) => {
    try{
        let portfolioId = req.params.id;
        let sites = await Site.find({_id:{$in:req.body.sites}});
        if (sites.length !== req.body.sites.length) {
            throw new Error('E42007')
        };
        let isSiteAssignedYet = sites.every(site => site.portfolio === null);
        if (!isSiteAssignedYet) {
            throw new Error('E42008')
        };
        let updatedPortfolio = await Portfolio.findByIdAndUpdate({_id:portfolioId},{$push:{sites: req.body.sites}}, {new: true});
        if (!updatedPortfolio){
            throw new Error('E42007')
        }
        await Site.updateMany({_id:{$in:req.body.sites}},{portfolio:portfolioId});

        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                updatedPortfolio:{
                    _id: updatedPortfolio._id,
                    name: updatedPortfolio.name,
                    code: updatedPortfolio.code,
                    sites: updatedPortfolio.sites,
                    domain: updatedPortfolio.domain,
                    
                },
                addedSites: sites
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}


// //PC00009
// module.exports.getAddedSites = async(req,res) => {
//     try{
//         let id = req.params.id;
//         let addedSites = await Site.find({portfolio: id}).select('name code');
//         res.status(httpResponseCode.ok).send({
//             code:httpResponseCode.ok, 
//             message:'OK', 
//             data: {
//                 addedSites: addedSites,
//             },
//         })
//     } catch(error) {
//         return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
//     }
// }

/**PC00010
 * Remove sites from portfolio
 * @param {_id} req 
 * @param {*} res 
 * @returns Object of detailed infor of updated portfolio and removed sites
 */
module.exports.removeSite = async (req,res) => {
    try{
        let portfolioId = req.params.id;
        let sites = req.body.sites;
        let sitesInPortfolio = await Portfolio.findById(portfolioId).select('sites');
        if (!sitesInPortfolio) {
            throw new Error('E42007')
        };
        if (!sites.every(site => sitesInPortfolio.sites.includes(site))) {
            throw new Error('E42007')
        };
        let updatedPortfolio = await Portfolio.findByIdAndUpdate(portfolioId,{$pullAll:{sites: sites}});
        if (!updatedPortfolio){
            throw new Error('E42007')
        }
        await Site.updateMany({_id:{$in:sites}},{portfolio:null});
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                updatedPortfolio:{
                    _id: updatedPortfolio._id,
                    name: updatedPortfolio.name,
                    code: updatedPortfolio.code,
                    sites: updatedPortfolio.sites,
                    domain: updatedPortfolio.domain,
                },
                removedSites: sites,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}

//PC0011
module.exports.deletePorfolio = async (req,res) => {
    try{
        let portfolioId = req.params.id;
        let portfolio = await Portfolio.findById(portfolioId);
        if (portfolio.sites.length) {
            throw new Error('E42009')
        };
        let deletedPortfolio = await Portfolio.findByIdAndDelete(portfolioId);
        if (!deletedPortfolio) {
            throw new Error('E42007')
        };
        await Domain.updateOne({_id:portfolio.domain},{$pull: {portfolios: portfolio._id}})
        return res.status(httpResponseCode.ok).send({
            code:httpResponseCode.ok, 
            message:'OK', 
            data: {
                _id: deletedPortfolio._id,
                name: deletedPortfolio.name,
                code: deletedPortfolio.code,
                sites: deletedPortfolio.sites,
                domain: deletedPortfolio.domain,
            },
        })
    } catch(error) {
        return res.status(catchErrors(error).errCode).send(catchErrors(error).errMessages);
    }
}