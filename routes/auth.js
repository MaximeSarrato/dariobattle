const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const router = express.Router();
router.use(passport.initialize());
router.use(passport.session());

const User = mongoose.model('users');

const isAuthenticated = require('../middlewares/isAuthenticated');

router.get('/token', isAuthenticated, (req, res) => {
	console.log('GET /auth/token');
	const user = res.locals.user;
	res
		.header('x-auth', user.token)
		.send({ uid: user._id, username: user.username });
});

router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'email']
	})
);

router.get(
	'/google/callback',
	passport.authorize('google', { failureRedirect: '/' }),
	(req, res) => {
		console.log('GET /auth/google/callback');

		res.redirect('http://localhost:9000/dashboard');
	}
);

router.get('/logout', isAuthenticated, async (req, res) => {
	console.log('GET /users/logout');
	const { user } = res.locals;
	user.token = '';
	// Send response before update database
	// in order to user does not need to wait
	// the database update to be finished
	req.session.destroy(err => {
		if (err) throw err;
		res.clearCookie('connect.sid');
		res.sendStatus(200);
	});
	await user.save();
});

module.exports = router;
