const Event = require('../../models/UEvent.model')
const Site = require('../../models/Site.model')
const Plant = require('../../models/Plant.model')
const error = require('../../common/err')
const {severity} = require( "../../common/rule")
const moment = require('moment')
var mongoose = require('mongoose')

/**
 * API E-E0001
 * API Get List Event
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.getListEvent = async (req, res) => {
    try {
        let eventList = []
        let argumentOderBy = ""
        let argumentSort = ""
        //console.log(req.query)
        let { siteId, plantId , orderBy, sortBy } = req.query
        siteId = ['null', 'undefined', ''].indexOf(siteId) < 0 ? siteId : null
        plantId = ['null', 'undefined', ''].indexOf(plantId) < 0 ? plantId : null
        switch (orderBy) {
            case  "severity":
                argumentOderBy = "severity"
                break
            case "beginningTime":
                argumentOderBy = "beginning_time"
                break
            default:
                argumentOderBy = "_id"
        }
        switch (sortBy) {
            case "asc":
                argumentSort = argumentOderBy
                break
            default:
                argumentSort = `-${argumentOderBy}`
        }
        const page = parseInt(req.query.page) || 1
        const limit = parseInt((req.query.limit)) || 25
        let totalEvents = await Event.countDocuments()
        let startIndex = (page -1) * limit
        if (!siteId && !plantId) {
            console.log("Feching All Event")
            const events = await Event.aggregate([
                {
                    $lookup: {
                        from: "sites",
                        localField: "site",
                        foreignField: "_id",
                        as: "siteInfo"
                    }
                },
                {
                    $unwind: "$siteInfo"
                },
                {
                    $lookup: {
                        from: "plants",
                        localField: "plant",
                        foreignField: "_id",
                        as: "plantInfo"
                    }
                },
                {
                    $unwind: "$plantInfo"
                }

            ])
                .sort(argumentSort)
                .skip(startIndex)
                .limit(limit)
            eventList = events.map(event => {
                return {
                    id: event._id,
                    severity: parseInt(event.severity),
                    severityText: severity[event.severity],
                    scope: event.scope,
                    eventName: event.name,
                    beginningTime: moment(event.beginning_time).format("YYYY/MM/DD HH:mm:ss"),
                    location: `${event.plantInfo.name},${event.siteInfo.name}`
                }
            })
        }
        if (siteId && !plantId ) {
            console.log("Get Event By Site")
            const site = await Site.findOne({ _id: siteId })
            let events = await Event.find({ site: mongoose.Types.ObjectId(siteId) })
                .sort(argumentSort)
                .skip(startIndex)
                .limit(limit)
            eventList = events.map(event => {
                return {
                    id: event._id,
                    severity: parseInt(event.severity),
                    severityText: severity[event.severity],
                    scope: event.scope,
                    eventName: event.name,
                    beginningTime: moment(event.beginning_time).format("YYYY/MM/DD HH:mm:ss"),
                    location: site.name
                }
            })
        }
        if ((!siteId && plantId) || (siteId && plantId)) {
            console.log("Get Event By Plant")
            const plant = await Plant.findOne({ _id: plantId })
            const siteId = plant.site
            const site = await Site.findOne({ _id: siteId })
            let events = await Event.find({ plant: mongoose.Types.ObjectId(plantId) })
                .sort(argumentSort)
                .skip(startIndex)
                .limit(limit)
            eventList = events.map(event => {
                return {
                    id: event._id,
                    severity: parseInt(event.severity),
                    severityText: severity[event.severity],
                    scope: event.scope,
                    eventName: event.name,
                    beginningTime: moment(event.beginning_time).format("YYYY/MM/DD HH:mm:ss"),
                    location: `${plant.name},${site.name}`
                }
            })
        }
        res.status(200).send({
            code: 200,
            message: "OK",
            data: {
                meta: {
                    current : page,
                    pageSize: limit,
                    total: eventList.length
                },
                items: eventList
            }
        })
    } catch (err) {
        //console.log(err)
        res.status(500).send({
            code: 500,
            message: "Error System"
        })
    }
}
module.exports.getDetailEvent = async (req, res) => {
    try {
        const { eventId } = req.params
        const event = await Event.findOne({ _id: eventId })
        const siteId = event.site
        const plantId = event.plant
        const site = await Site.findOne({ _id: siteId })
        const plant = await Plant.findOne({ _id: plantId })
        let siteName = site !== null ? site.name : ""
        let plantName = plant !== null ? plant.name : ""
        res.status(200).send({
            code: 200,
            message: "OK",
            data: {
                id: event._id,
                severity: parseInt(event.severity),
                severityText: severity[event.severity],
                scope: event.scope,
                eventName: event.name,
                beginningTime: moment(event.beginning_time).format("YYYY/MM/DD HH:mm:ss"),
                siteName: siteName,
                plantName: plantName
            }
        })
    } catch (error) {
        res.status(500).send({
            code: 500,
            message: "Error System"
        })
    }
}