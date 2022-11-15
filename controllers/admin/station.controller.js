var Station = require('../../models/Site.model')

module.exports.getList = async function (req, res) {
  try {
    siteList = await Domain.find({})
    res.status(200).send({ code: 200, message: 'OK', data: domainList })
  } catch (err) {
    res.status(400).send({ result: 0, err })
  }
};

module.exports.postAdd = async function (req, res) {
  //Create a new station
  try {
    const station = new Station(req.body)
    console.log(station)
    await station.save()
    //const token = await user.generateAuthToken()
    res.status(201).send({ "result": 1, station })
  } catch (error) {
    res.status(400).send({ "result": 0, error })
  }
};

// module.exports.getEdit = function(req, res) {
// 	var id = req.params.id;
// 	Station.findById(id).then(function(station){
// 		res.render('admin/stations/edit', {
// 			station: station
// 		});
// 	});
// };

// module.exports.postEdit = function(req, res) {
// 	var query = {"_id": req.params.id};
// 	var data = {
// 		"name" : req.body.name,
// 	    "description" : req.body.description,
// 	    "address" : req.body.address,
// 	    "information" : req.body.information,
// 	    "type" : req.body.type,
// 	    "active" : req.body.active,
// 	    "is_main" : req.body.is_main,
// 	    "note" : req.body.note,
// 	    "priority" : req.body.priority
// 	}
// 	console.log(query)
// 	Station.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
// 	    if (err) return res.send(500, { error: err });
// 	    res.redirect('/admin/station');
// 	});

// };

// module.exports.getDelete = function(req, res) {
// 	var id = req.params.id;
// 	Station.findByIdAndDelete(id, function(err, doc){
// 	    if (err) return res.send(500, { error: err });
// 	    res.redirect('/admin/station');
// 	});

// };