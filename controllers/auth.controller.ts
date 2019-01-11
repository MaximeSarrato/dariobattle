import * as express from 'express';
import * as passport from 'passport';
import Controller from '../interfaces/controller.interface';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import logger from '../services/logger';

class AuthController implements Controller {
  public path = '/auth';
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
    this.router.use(passport.initialize());
    this.router.use(passport.session());
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/token`, isAuthenticated, this.getToken);
    this.router.get(
      `${this.path}/google`,
      passport.authenticate('google', {
        scope: ['profile', 'email'],
      }),
    );
    this.router.get(
      `${this.path}/google/callback`,
      passport.authorize('google', { failureRedirect: '/' }),
      (req: express.Request, res: express.Response) => {
        logger.info('GET /auth/google/callback');

        res.redirect('/dashboard');
      },
    );
    this.router.get(`${this.path}/logout`, isAuthenticated, this.logOut);
  }

  private getToken = (req: express.Request, res: express.Response) => {
    logger.info('GET /auth/token');
    const user = res.locals.user;
    res
      .header('x-auth', user.token)
      .send({ uid: user._id, username: user.username });
  }

  private logOut = async (req: express.Request, res: express.Response) => {
    logger.info('GET /users/logout');
    const { user } = res.locals;
    user.token = '';
    // Send response before update database
    // in order to user does not need to wait
    // the database update to be finished
    req.session.destroy((err) => {
      if (err) {
        throw err;
      }
      res.clearCookie('connect.sid');
      res.sendStatus(200);
    });
    await user.save();
  }
}

export default AuthController;
