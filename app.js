const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// Models
require('./models/User');

// Services
require('./services/passport');

// Routes
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

app.use(
	cors({
		exposedHeaders: ['x-auth'],
		origin: ['http://localhost:9000', 'http://localhost'],
		credentials: true
	})
);

app.use(
	session({
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true,
		cookie: {
			httpOnly: false
		}
	})
);

app.use(bodyParser.json());
app.use('/users', usersRoutes);
app.use('/auth', authRoutes);

app.use(express.static('./client/public/dist'));

app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, './client', 'public', 'index.html'));
});

module.exports = app;
