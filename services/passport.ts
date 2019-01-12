import * as passport from 'passport';
import * as mongoose from 'mongoose';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';
import * as passportGoogle from 'passport-google-oauth';
import User from '../models/User';
import logger from './logger';

const GoogleStrategy = passportGoogle.OAuth2Strategy;

const callbackURL =
  process.env.NODE_ENV === 'production'
    ? 'https://dariobattle.herokuapp.com/auth/google/callback'
    : '/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      logger.info('Google OAuth Strategy');
      /**
       * Link Google account to local account
       */
      if (req.session.jwt) {
        const token = req.session.jwt;
        const decodedToken = jwt.decode(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken.uid);
        if (user) {
          logger.info(
            `Linking Google Account for existing user with id ${user._id}`,
          );
          user.googleID = profile.id;
          await user.save();
          return done(null, user);
        }
        /**
         * Connection and Signup with Google account
         */
      } else {
        logger.info('Login using Google OAuth');
        let user = await User.findOne({ googleID: profile.id });
        if (user) {
          const duration = moment.duration(3, 'days');
          user.token = jwt.encode(
            { uid: user._id, duration },
            process.env.JWT_SECRET,
          );
          req.session.jwt = user.token;
          await user.save();
          return done(null, user);
        } else {
          /**
           * Create an account from Google Account
           */
          const id = new mongoose.Types.ObjectId();
          logger.info(`Creating new user with id ${id}`);
          const duration = moment.duration(3, 'days');
          user = new User({
            _id: id,
            googleID: profile.id,
            token: jwt.encode({ uid: id, duration }, process.env.JWT_SECRET),
            createdAt: Date.now(),
          });
          req.session.jwt = user.token;
          await user.save();
          return done(null, user);
        }
      }
    },
  ),
);
