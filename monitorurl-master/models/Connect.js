mongoose = require('mongoose');
mongoose.Promises = global.Promises;

before(function(done) {
	mongoose.connect('mongodb://localhost/urldatabase', { useNewUrlParser: true });
	mongoose.connection
		.once('open', function() {
			console.log('connection successfull');
			done();
		})
		.on('error', function(error) {
			console.log('connection error:', error);
		});
});

beforeEach(function(done) {
	mongoose.connection.collections.urlschemas.drop(function() {
		console.log('droped');
		done();
	});
});
