const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jwt-simple');
const moment = require('moment');

const router = express.Router();
// Keys
const keys = require('../config/keys');

// Models
const User = mongoose.model('users');

// Middlewares
const isAuthenticated = require('../middlewares/isAuthenticated');

router.get('/:id', isAuthenticated, async (req, res) => {
	console.log(`GET /users/${req.params.id}`);
	const user = await User.findById(req.params.id);
	if (!user) {
		return res.status(404).send('This user does not exist in our database.');
	}

	res.send(user);
});

router
	.put('/', isAuthenticated, (req, res) => {
		// Update user here
		res.send('Got it!');
	})
	.delete('/', isAuthenticated, (req, res) => {
		const user = res.locals.user;
		user.remove().then(oldUser => {
			res.sendStatus(200);
		});
	});

router.post('/username', isAuthenticated, async (req, res) => {
	console.log('POST /users/username');
	if (!req.body.username) {
		res.status(400).send('You must provide an username');
	}

	const user = await User.findOne({ username: req.body.username });
	if (user) {
		return res.status(409).send('This username is taken');
	}
	res.sendStatus(200);
});

router.post('/signup', async (req, res) => {
	const saltRounds = 10;
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(403).send({ error: 'Invalid form submission.' });
	}
	// User is authenticated with Google
	// and we will add local credentials to his account
	if (req.session.jwt) {
		console.log('SESSION');
		const token = req.session.jwt;
		const user = await User.findOne({ token });
		if (!user) {
			return res.status(404).send({ error: 'This token does not exist.' });
		}
		console.log('user: ', user);
		const hash = await bcrypt.hash(password, saltRounds);
		// Add credentials to existing user
		user.username = username;
		user.password = hash;
		console.log('user after update: ', user);

		user.save().then(() => {
			res.send({ username });
		});
		// Create a local account
	} else {
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res
				.status(403)
				.send('This username is already taken. Please choose another! :)');
		}
		// Hash password
		bcrypt.hash(password, saltRounds).then(hash => {
			// Create new user
			const user = new User({
				username,
				password: hash,
				createdAt: Date.now()
			});
			user.save().then(() => {
				res.sendStatus(200);
			});
		});
	}
});

router.post('/login', async (req, res) => {
	console.log('POST /login');

	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(403).send('Invalid form submission.');
	}

	const user = await User.findOne({ username });

	if (!user) {
		return res
			.status(404)
			.send('This username does not exist in our database.');
	}

	bcrypt.compare(password, user.password).then(match => {
		if (!match) {
			return res.status(403).send('Wrong password!');
		}
		const duration = moment.duration(3, 'days');
		user.token = jwt.encode({ uid: user._id, duration }, keys.jwtSecret);
		req.session.jwt = user.token;
		user.save().then(data => {
			res
				.header('X-Auth', user.token)
				.send({ uid: user._id, username: user.username });
		});
	});
});

module.exports = router;
