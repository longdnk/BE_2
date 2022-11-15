const Portfolio = require('../../models/Portfolio.model')
const Site = require('../../models/Site.model')
const Plant = require('../../models/Plant.model')
const err = require('../../common/err')

//A0010-1 Get site detail 
module.exports.getSiteDetail = async (req, res) => {
    try {
        const siteId = req.params.id
        let site = await Site.findById({ _id: siteId })
        const plants = site.plants
        let listPlant = []
        for (let i = 0; i < plants.length; i++) {
            let plant = await Plant.findById({ _id: plants[i].valueOf() })
            let p = {
                id: plant._id,
                siteId: siteId,
                name: plant.name
            }
            listPlant.push(p)
        }
        const data = {
            "code": 200,
            "message": "OK",
            "data": {
                "id": site._id,
                "name": site.name,
                "plants": listPlant
            },
        }
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(err.E40001)
    }
}
module.exports.getListAnalysis = async (req, res) => {
    try {
        const scope = req.params.scope
        let dataList = []
        switch (scope) {
            case 'site':
                dataList = [
                    {
                        "title": "Overview",
                        "features": [
                            {
                                "title": "Expected Production vs Plant Production",
                                "dataType": "expected_production_and_plant_production",
                                "scope": "site",
                                "selected": 1
                            },
                            {
                                "title": "Plant Irradiation Vs Budget Irradiation",
                                "dataType": "plant_irradiation_and_budget_irradiation",
                                "scope": "site",
                                "selected": 0
                            },
                            {
                                "title": "Plant Production vs Budget Production",
                                "dataType": "plant_production_and_budget_production",
                                "scope": "site",
                                "selected": 0
                            },
                            {
                                "title": "Total Production",
                                "dataType": "total_production",
                                "scope": "site",
                                "selected": 0
                            }
                        ],
                    },
                    {
                        "title": "Performance",
                        "features": [
                            {
                                "title": "Specific Yield",
                                "dataType": "specific_yield",
                                "scope": "site",
                                "selected": 0
                            },

                        ],
                    },
                    {
                        "title": "Environment",
                        "features": [

                        ],
                    },
                    {
                        "title": "Inverters",
                        "features": [

                        ],
                    },
                    {
                        "title": "Financial",
                        "features": [
                            {
                                "title": "Actual Revenue vs Budget Revenue",
                                "dataType": "actual_revenue_and_budget_revenue",
                                "scope": "site",
                                "selected": 0
                            }
                        ],
                    }
                ]
                break;

            case 'plant':
                dataList = [
                    {
                        "title": "Overview",
                        "features": [
                            {
                                "title": "Actual Production & Actual Irradiation",
                                "dataType": "actual_production_and_irradiation",
                                "scope": "plant",
                                "selected": 1
                            },
                            {
                                "title": "Actual Irradiation vs Budget Irradiation (Monthly,YTD)",
                                "dataType": "actual_grid_meter2",
                                "scope": "plant",
                                "selected": 0
                            },
                            {
                                "title": "Actual Production & Budget Production",
                                "dataType": "actual_production_and_budget_production",
                                "scope": "plant",
                                "selected": 0
                            },
                            {
                                "title": "Actual PR vs Budget PR",
                                "dataType": "actual_pr_and_budget_pr",
                                "scope": "plant",
                                "selected": 0
                            }
                        ],
                    },
                    {
                        "title": "Performance",
                        "features": [
                            {
                                "title": "Inverter Performance Ratio",
                                "dataType": "inverter_performance_ratio",
                                "scope": "plant",
                                "selected": 0
                            },

                        ],
                    },
                    {
                        "title": "Environment",
                        "features": [
                            {
                                "title": "Solar Irradiance & Module Temperatures",
                                "dataType": "solar_irradiance_and_module_temperatures",
                                "scope": "plant",
                                "selected": 0
                            }
                        ],
                    },
                    {
                        "title": "Inverters",
                        "features": [
                            {
                                "title": "Inverter AC Current",
                                "dataType": "inverter_current",
                                "scope": "plant",
                                "selected": 0
                            },
                            {
                                "title": "Inverter AC Energy",
                                "dataType": "inverter_energy",
                                "scope": "plant",
                                "selected": 0
                            },
                            {
                                "title": "Inverter AC Power",
                                "dataType": "inverter_power",
                                "scope": "plant",
                                "selected": 0
                            }
                        ],
                    },
                    {
                        "title": "Financial",
                        "features": [
                            {
                                "title": "Actual Revenue vs Budget Revenue",
                                "dataType": "actual_revenue_and_budget_revenue",
                                "scope": "plant",
                                "selected": 0
                            }
                        ],
                    }
                ]
                break;
            default:
                break;
        }
        const data = {
            "code": 200,
            "message": "OK",
            "data": dataList
        }
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(err.E40001)
    }
}
