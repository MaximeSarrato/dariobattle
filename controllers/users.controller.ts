import * as express from 'express';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import * as jwt from 'jwt-simple';
import Controller from '../interfaces/controller.interface';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import User from '../models/User';
import logger from '../services/logger';

class UsersController implements Controller {
  public path = '/users';
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, isAuthenticated, this.getUser);
    this.router.put(`${this.path}/:id`, isAuthenticated, this.updateUser);
    this.router.delete(`${this.path}/:id`, isAuthenticated, this.deleteUser);
    this.router.post(
      `${this.path}/username`,
      isAuthenticated,
      this.addUsername,
    );
    this.router.post(`${this.path}/signup`, this.signUp);
    this.router.post(`${this.path}/login`, this.logIn);
  }

  private getUser = async (req: express.Request, res: express.Response) => {
    logger.info(`GET /users/${req.params.id}`);
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('This user does not exist in our database.');
    }

    res.send(user);
  }

  private updateUser = (req: express.Request, res: express.Response) => {
    // TODO: Implement this method
  }

  private deleteUser = (req: express.Request, res: express.Response) => {
    const user = res.locals.user;
    user.remove().then((oldUser) => {
      res.sendStatus(200);
    });
  }

  private addUsername = async (req: express.Request, res: express.Response) => {
    logger.info('POST /users/username');
    if (!req.body.username) {
      res.status(400).send('You must provide an username');
    }

    const user = await User.findOne({ username: req.body.username });
    if (user) {
      return res.status(409).send('This username is taken');
    }
    res.sendStatus(200);
  }

  private signUp = async (req: express.Request, res: express.Response) => {
    const saltRounds = 10;
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(403).send({ error: 'Invalid form submission.' });
    }
    // User is authenticated with Google
    // and we will add local credentials to his account
    if (req.session.jwt) {
      const token = req.session.jwt;
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(404).send({ error: 'This token does not exist.' });
      }
      const hash = await bcrypt.hash(password, saltRounds);
      // Add credentials to existing user
      user.username = username;
      user.password = hash;

      user
        .save()
        .then(() => {
          res.send({ username });
        })
        .catch((err) =>
          logger.error(`Impossible to create the user ${username}` + err),
        );
      // Create a local account
    } else {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res
          .status(403)
          .send('This username is already taken. Please choose another! :)');
      }
      // Hash password
      bcrypt.hash(password, saltRounds).then((hash) => {
        // Create new user
        const user = new User({
          username,
          password: hash,
          createdAt: Date.now(),
        });
        user.save().then(() => {
          res.sendStatus(200);
        });
      });
    }
  }

  private logIn = async (req: express.Request, res: express.Response) => {
    logger.info('POST /login');

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

    bcrypt.compare(password, user.password).then((match) => {
      if (!match) {
        return res.status(403).send('Wrong password!');
      }
      const duration = moment.duration(3, 'days');
      user.token = jwt.encode(
        { uid: user._id, duration },
        process.env.JWT_SECRET,
      );
      req.session.jwt = user.token;
      user.save().then((data) => {
        res
          .header('X-Auth', user.token)
          .send({ uid: user._id, username: user.username });
      });
    });
  }
}

export default UsersController;
