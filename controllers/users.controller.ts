import * as express from 'express';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import * as jwt from 'jwt-simple';
import Controller from '../interfaces/controller.interface';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import User from '../models/User';
import logger from '../services/logger';
import * as mongoose from 'mongoose';
import { IUserDocument } from '../interfaces/IUserDocument';

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

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('The user id is not valid.');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('This user does not exist in our database.');
    }

    res.send(user);
  }

  private updateUser = (req: express.Request, res: express.Response) => {
    // TODO: Implement this method
    logger.info(`PUT /users/:${req.params.id}`);
    res.sendStatus(200);
  }

  /**
   * Delete an user from the database.
   */
  private deleteUser = (req: express.Request, res: express.Response) => {
    logger.info(`DELETE /users/:${req.params.id}`);
    const user = res.locals.user;
    user
      .remove()
      .then((deletedUser: IUserDocument) => {
        logger.info(
          `The user with id ${deletedUser._id} and username ${
            deletedUser.username
          } has been deleted.`,
        );
        res.sendStatus(200);
      })
      .catch((err) => {
        logger.error(`Impossible to delete the user with id ${req.params.id}.`);
        res.sendStatus(500);
      });
  }

  private addUsername = async (req: express.Request, res: express.Response) => {
    logger.info('POST /users/username');
    if (!req.body.username) {
      return res.status(400).send('You must provide an username');
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

    /**
     * User got already an account with Google OAuth and is authenticated
     * with it. We will add local credentials (username and password)
     * to his account.
     */
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
    const { username, password } = req.body;
    logger.info(`POST /users/login for user ${username}`);

    if (!username) {
      return res.status(403).send('You must provide an username.');
    } else if (!password) {
      return res.status(403).send('You must provide a password.');
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .send('This username does not exist in our database.');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(403).send('Wrong password!');
    }
    const duration = moment.duration(3, 'days');
    user.token = jwt.encode(
      { uid: user._id, duration },
      process.env.JWT_SECRET,
    );
    req.session.jwt = user.token;
    await user.save();
    return res
      .header('X-Auth', user.token)
      .send({ uid: user._id, username: user.username });
  }
}

export default UsersController;
