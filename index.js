const app = require('./app');
const mongoose = require('mongoose');
const server = require('http').Server(app);

const keys = require('./config/keys');

// Connect to database
mongoose.connect(keys.mongoURI);

// Socket.IO
require('./sockets/io').listen(server);

const port = process.env.PORT || 3000;

server.listen(port, () => {
	console.log('Server is listening on port: ', port);
});
