import * as passport from 'passport';
import * as mongoose from 'mongoose';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';
import * as passportGoogle from 'passport-google-oauth';
import User from '../models/User';

const GoogleStrategy = passportGoogle.OAuth2Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log('\n ---  Google Strategy --- \n');
      // Link Google account
      if (req.session.jwt) {
        const token = req.session.jwt;
        const decodedToken = jwt.decode(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken.uid);
        if (user) {
          user.googleID = profile.id;
          await user.save();
          return done(null, user);
        }
        // Connect with Google
      } else {
        console.log('Connect with Google');
        const user = await User.findOne({ googleID: profile.id });
        if (user) {
          const duration = moment.duration(3, 'days');
          user.token = jwt.encode({ uid: user._id, duration }, process.env.JWT_SECRET);
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
            token: jwt.encode({ uid: id, duration }, process.env.JWT_SECRET),
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
