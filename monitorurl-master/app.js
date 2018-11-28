const mongoose = require('mongoose');
var ping = require('ping');
var express = require('express');
var app = express();
var Urldata = require('./schema/Data');
const bodyParser = require('body-parser');
var hosts = [ 'facebook.com', 'google.com' ];
var i = 0;
var logs = [];
let unique = [];
RunThePings();
app.use(bodyParser.json());
retrive();
deleteurl();
getall();
updated();
addnew();
mongoose.connect('mongodb://localhost/urldatabase', { useNewUrlParser: true });
mongoose.connection
	.once('open', function() {
		console.log('connection successfull');
	})
	.on('error', function(error) {
		console.log('connection error:', error);
	});

var json = { Site: '0', Status: '0', Success: '0', Time: 0, _id: '0', id: '0' };
function RunThePings() {
	hosts.forEach(function(host) {
		var d = new Date();
		var n = d.getTime();
		ping.promise.probe(host).then(function(res) {
			var MongoClient = require('mongodb').MongoClient;
			var url = 'mongodb://localhost:27017/';
			json.Site = host;
			json._id = i;
			json.Success = 'TRUE';
			if (host === 'google.com') {
				json.id = '715157';
			}
			if (host === 'facebook.com') {
				json.id = '613521';
			}

			i++;
			if (res.alive == true) {
				json.Status = 'UP';
			} else {
				json.Status = 'DOWN';
			}
			var d1 = new Date();
			var n1 = d1.getTime();

			json.Time = n1 - n;
			logs.push(json);
			unique = logs.reduce(function(item, e1) {
				var matches = item.filter(function(e2) {
					return e1._id == e2._id;
				});
				if (matches.length == 0) {
					item.push(e1);
				}
				return item;
			}, []);
			if (unique[0]) {
				MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
					
					var dbo = db.db('urldatabase');
					unique.forEach(function(logg) {
						try {
							dbo.collection('urlschemas').insertOne(logg).then(() => {
								console.log('saved');
							});
							unique = [];
						} catch (err) {
							console.log(err);
						}
					});
				});
			}
		});
	});

	setTimeout(RunThePings, 100);
}

function retrive() {
	app.get('/retrive', (req, res) => {
		var value = req.query.retrive2;
		console.log(value);
		var MongoClient = require('mongodb').MongoClient;
		var url = 'mongodb://localhost:27017/';
		var uid = [];
		var utime = [];

		MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
			if (err) throw err;
			var dbo = db.db('urldatabase');
			dbo
				.collection('urlschemas')
				.aggregate([
					{
						$group: {
							_id: { Site: value },
							avg: { $avg: '$Time' },
							Status: { $push: '$Status' },
							Success: { $push: '$Success' }
						}
					}
				])
				.toArray(function(err, result) {
					if (err) throw err;
					utime = [ result[0].avg * 0.5, result[0].avg * 0.75, result[0].avg * 0.95, result[0].avg * 0.99 ];
					uid = [ result[0]._id.Site, result[0].avg, result[0].Status[0], result[0].Success[0], utime ];
					console.log(result.length);
					ustatus = result[0].Status;
					console.log(result);
					res.send(uid);
				});
		});
	});
}

function deleteurl() {
	app.get('/deleteurl', (req, res) => {
		var value4 = req.query.deleteurl4;
		console.log(value4);
		Urldata.deleteMany({ id: value4 }).then(function() {
			console.log('deleted');
		});
		res.send('data deleted');
	});
}

function addnew() {
	app.get('/addnew', (req, res) => {
		var valuen = req.query.addnew;
		console.log(valuen);
		hosts.push(valuen);
		res.send(hosts);
	});
}

function getall() {
	app.get('/getall', (req, res) => {
		var value5 = req.query.deleteurl4;
		console.log(value5);
		var MongoClient = require('mongodb').MongoClient;
		var url = 'mongodb://localhost:27017/';
		uid = [];
		usite = [];
		ustatus = [];
		utime = [];
		uuid = [];
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
			if (err) throw err;
			var dbo = db.db('urldatabase');
			dbo.collection('urlschemas').find({}).toArray(function(err, result) {
				if (err) throw err;

				for (i = 0; i < result.length; i++) {
					uid[i] = result[i]._id;
					usite[i] = result[i].Site;
					ustatus[i] = result[i].Status;
					utime[i] = result[i].Time;
				}
				console.log(uid, usite, ustatus, utime);
				res.send(result);
			});
		});
	});
}

function updated() {
	app.get('/updated', (req, res) => {
		var value3 = req.query.updated3;
		var value31 = req.query.updated31;
		console.log(value3);
		console.log(value31);
		var MongoClient = require('mongodb').MongoClient;
		var url = 'mongodb://localhost:27017/';
		MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
			if (err) throw err;
			var dbo = db.db('urldatabase');
			dbo.collection('urlschemas').updateMany({ Site: value3 }, { $set: { Site: value31 } }).then(() => {
				console.log('updated');
			});
			res.send('updated');
		});
		for (i = 0; i < hosts.length; i++) {
			if (hosts[i] === value3) {
				hosts.splice(i, 1, value31);
				console.log(hosts);
			}
		}
		console.log(hosts);
	});
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/menu', (req, res) => {
	res.sendFile(__dirname + '/web/index.html');
});

app.get('/', function(req, res) {
	res.send(logs);
});

app.listen(2000, function() {
	console.log('listen on port 2000');
});
