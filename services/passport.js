const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const jwt = require('jwt-simple');
const moment = require('moment');
const keys = require('../config/keys');

const User = mongoose.model('users');

// passport.serializeUser((user, done) => {
// 	done(null, user.id);
// });
//
// passport.deserializeUser((id, done) => {
// 	User.findById(id).then(user => {
// 		done(null, user);
// 	});
// });

passport.use(
	new GoogleStrategy(
		{
			clientID: keys.googleClientID,
			clientSecret: keys.googleClientSecret,
			callbackURL: '/auth/google/callback',
			passReqToCallback: true,
			proxy: true
		},
		async (req, accessToken, refreshToken, profile, done) => {
			console.log('\n ---  Google Strategy --- \n');
			// Link Google account
			if (req.session.jwt) {
				const token = req.session.jwt;
				const decodedToken = jwt.decode(token, keys.jwtSecret);
				const user = await User.findById(decodedToken.uid);
				if (user) {
					user.googleID = profile.id;
					await user.save();
					return done(null, user);
				}
				// Connect with Google
			} else {
				const user = await User.findOne({ googleID: profile.id });
				if (user) {
					const duration = moment.duration(3, 'days');
					user.token = jwt.encode({ uid: user._id, duration }, keys.jwtSecret);
					req.session.jwt = user.token;
					await user.save();
					return done(null, user);
				} else {
					// Just create an account with Google and when he is connected
					// ask him to choose an username
					const id = new mongoose.Types.ObjectId();
					const duration = moment.duration(3, 'days');
					const user = new User({
						_id: id,
						googleID: profile.id,
						token: jwt.encode({ uid: id, duration }, keys.jwtSecret),
						createdAt: Date.now()
					});
					console.log('user: ', user);
					req.session.jwt = user.token;
					await user.save();
					return done(null, user);
				}
			}
		}
	)
);
