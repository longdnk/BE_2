const Portfolio = require('../../models/Portfolio.model')
const Site = require('../../models/Site.model')
const Plant = require('../../models/Plant.model')
const Device = require('../../models/Device.model')
const User = require('../../models/User.model')
const err = require('../../common/err')

//A0010-2 Lấy danh sách các site - Chỉ lấy site (id và name) vs plant (id và name)
module.exports.getListSite = async (req, res) => {
    try {
        const { userId, type } = req.query
        if (!userId) return res.status(400).send({ error: 'id is not undefined' })
        const user = await User.findById({ _id: userId })
        //const portfolioId = user.portfolios[0]
        if (type === 'searchList') {
            let dataSite = []
            //const portfolio = await Portfolio.findById({ _id: portfolioId })
            const sites = user.sites
            for (let i = 0; i < sites.length; i++) {
                let site = await Site.findOne({ _id: sites[i].valueOf() })
                let siteId = sites[i]
                const plants = site.plants
                let plantList = []
                for (let i = 0; i < plants.length; i++) {
                    let plant = await Plant.findOne({ _id: plants[i].valueOf() })
                    let p = {
                        id: plant._id,
                        siteId: siteId,
                        name: plant.name
                    }
                    plantList.push(p)
                }
                let s = {
                    id: site._id,
                    name: site.name,
                    plants: plantList
                }
                dataSite.push(s)
            }
            const data = {
                "code": 200,
                "message": "OK",
                "data": dataSite
            }
            res.status(200).send(data)
        }
        // A0010-2 Lấy danh sách các site - Chỉ lấy id và name
        if (type === 'selectList') {
            let dataSite = []
            const sites = user.sites
            for (let i = 0; i < sites.length; i++) {
                let site = await Site.findOne({ _id: sites[i].valueOf() })
                let s = {
                    id: site._id,
                    name: site.name
                }
                dataSite.push(s)
            }
            const data = {
                "code": 200,
                "message": "OK",
                "data": dataSite
            }
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(400).send(err.E40001)
    }

}
// Update API A0010-2 : Get list Site by Portfolio
module.exports.getListSiteNew = async (req, res) => {
    try {
        const { userId, type } = req.query
        if (!userId) return res.status(400).send({ error: 'id is not undefined' })
        const user = await User.findById({ _id: userId })
        if (type === 'searchList') {
            const portfolios = user.portfolios
            let portfolioData = []
            for (let index = 0; index < portfolios.length; index++) {
                const portfolioId = portfolios[index].valueOf()
                const portfolio = await Portfolio.findOne({ _id: portfolioId })
                const sites = portfolio.sites
                let dataSite = []
                for (let i = 0; i < sites.length; i++) {
                    let site = await Site.findOne({ _id: sites[i].valueOf() })
                    let siteId = sites[i]
                    const plants = site.plants
                    let plantList = []
                    for (let i = 0; i < plants.length; i++) {
                        let plant = await Plant.findOne({ _id: plants[i].valueOf() })
                        let p = {
                            id: plant._id,
                            siteId: siteId,
                            name: plant.name
                        }
                        plantList.push(p)
                    }
                    let s = {
                        id: site._id,
                        name: site.name,
                        plants: plantList
                    }
                    dataSite.push(s)
                }
                let p = {
                    id: portfolio.id,
                    name: portfolio.name,
                    sites: dataSite
                }
                portfolioData.push(p)
            }

            const data = {
                "code": 200,
                "message": "OK",
                "data": portfolioData
            }
            res.status(200).send(data)
        }
        // A0010-2 Lấy danh sách các site - Chỉ lấy id và name
        if (type === 'selectList') {
            let dataSite = []
            const sites = user.sites
            for (let i = 0; i < sites.length; i++) {
                let site = await Site.findOne({ _id: sites[i].valueOf() })
                let s = {
                    id: site._id,
                    name: site.name
                }
                dataSite.push(s)
            }
            const data = {
                "code": 200,
                "message": "OK",
                "data": dataSite
            }
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(400).send(err.E40001)
    }

}
//A0011-1 
// Start here
module.exports.getListPlant = async (req, res) => {
    try {
        const { siteId, type } = req.query
        if (type === 'overview') {
            if (siteId == 'null') {
                const user = req.user
                const sites = user.sites
                console.log(user)
                let plantList = []
                for (let i = 0; i < sites.length; i++) {
                    let site = await Site.findOne({ _id: sites[i].valueOf() })
                    let siteId = sites[i]
                    const plants = site.plants
                    for (let i = 0; i < plants.length; i++) {
                        let plant = await Plant.findOne({ _id: plants[i].valueOf() })
                        let devices = await Device.find({ plant: plant._id })
                        const plantStatus = Math.max(...devices.map(value => value?.status), 10);
                        let p = {
                            id: plant._id,
                            status: plantStatus,
                            name: plant.name,
                            powerValue: plant.capacity,
                            powerUnit: "kWp",
                            coordinates: {
                                lat: plant.lat,
                                lng: plant.lng
                            },
                            commissioningOn: "Jun 15 2022",
                            siteId: site._id,
                            siteName: site.name,
                            address: plant.address,
                            modules: plant.modules,
                            southOrientation: plant.southOrientation,
                            tilt: plant.tilt,
                            inverter: plant.inverter
                        }
                        plantList.push(p)
                    }
                }
                let totalPowerValue = plantList.map(value => value.powerValue).reduce((prev, next) => prev + next, 0); // sum function
                let totalPowerValueMW = parseFloat(totalPowerValue / 1000)
                const data = {
                    "code": 200,
                    "message": "OK",
                    "data": {
                        "total": plantList.length,
                        "powerValue": totalPowerValueMW,
                        "powerUnit": "MWp",
                        "plants": plantList
                    }
                }
                res.status(200).send(data)

            } else {
                let site = await Site.findOne({ _id: siteId })
                let plants = site.plants
                let plantList = []
                for (let i = 0; i < plants.length; i++) {
                    const plant = await Plant.findById({ _id: plants[i].valueOf() })
                    let devices = await Device.find({ plant: plant._id })
                    const plantStatus = Math.max(...devices.map(value => value?.status), 10)
                    let p = {
                        id: plant._id,
                        status: plantStatus,
                        name: plant.name,
                        powerValue: plant.capacity,
                        powerUnit: "kWp",
                        coordinates: {
                            lat: plant.lat,
                            lng: plant.lng
                        },
                        commissioningOn: "Jun 15 2022",
                        siteId: site._id,
                        siteName: site.name,
                        description: plant.description,
                        address: plant.address,
                        modules: plant.modules,
                        southOrientation: plant.southOrientation,
                        tilt: plant.tilt,
                        inverter: plant.inverter,
                    }
                    plantList.push(p)
                }

                let totalPowerValue = plantList.map(value => value.powerValue).reduce((prev, next) => prev + next, 0); // sum function
                let totalPowerValueMW = parseFloat(totalPowerValue / 1000)
                const data = {
                    "code": 200,
                    "message": "OK",
                    "data": {
                        "total": plantList.length,
                        "powerValue": totalPowerValueMW,
                        "powerUnit": "MWp",
                        "plants": plantList
                    }
                }
                res.status(200).send(data)
            }
        }
        if (type === 'selectList') {
            const site = await Site.findOne({ _id: siteId })
            const plants = site.plants
            let plantList = []
            for (let i = 0; i < plants.length; i++) {
                const plant = await Plant.findById({ _id: plants[i].valueOf() })
                const p = {
                    id: plant._id,
                    name: plant.name
                }
                plantList.push(p)
            }
            const data = {
                "code": 200,
                "message": "Ok",
                "data": plantList
            }
            res.status(200).send(data)
        }
    } catch (error) {
        console.log(error)
        res.status(400).send(err.E40001)
    }
}
