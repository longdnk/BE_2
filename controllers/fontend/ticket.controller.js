const Event = require('../../models/Event.model')
const Ticket = require('../../models/TicketEvent.model')
const error = require('../../common/err')
const success = require('../../common/success')
var mongoose = require('mongoose')
module.exports.postCreateTicket = async (req, res) => {
    try {
        let {eventId, users, description} = req.body
        const event = mongoose.Types.ObjectId(eventId)
        users = users.map(user => {
            return mongoose.Types.ObjectId(user.id)
        })
        const ticket = new Ticket({event, users, description})
        await ticket.save()
        res.status(200).send({ suceess: success.S26001, data: ticket })
    } catch (err) {
        res.status(400).send(error.E40001)
    }
}
module.exports.postDeleteTicket = async (req, res) => {
    try {
        let ticketId = req.params.id
        const ticket = await Ticket.findByIdAndDelete({_id: ticketId})
        const data = {
            "code": 200,
            "message": "OK",
            "data": {}
        }
        res.status(200).send(data)
    } catch (err) {
        res.status(400).send(error.E40001)
    }
}
module.exports.postEditTicket = async (req, res) => {
    try {
        const ticketId = req.params.id
        let { users, description, status} = req.body
        users = users.map(user => {
            return mongoose.Types.ObjectId(user.id)
        })
        const dataUpdated = {
            users: users,
            description: description,
            status: status? status : 0,
            updated_at: Date.now()
        }
        let ticket_edited = await Ticket.findOneAndUpdate({_id: ticketId}, dataUpdated , { 'upsert': true, returnOriginal: false })
        res.status(200).send({ "code": 200, "message": "OK", "data": {} })
    } catch (err) {
        res.status(400).send(error.E40001)
    }
}