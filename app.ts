import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as session from 'express-session';
import * as path from 'path';

/**
 * Load environment variables
 */
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env' });
}

// Load passport
import './services/passport';

import Controller from './interfaces/controller.interface';

class App {
  public app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  private initializeMiddlewares() {
    // support application/json type post data
    this.app.use(bodyParser.json());
    this.app.use(express.static('client/public/dist'));
    this.app.use(
      cors({
        exposedHeaders: ['x-auth'],
        origin: ['http://localhost:9000', 'http://localhost'],
        credentials: true,
      }),
    );
    this.app.use(
      session({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true,
        cookie: {
          httpOnly: false,
        },
      }),
    );
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller: Controller) => {
      this.app.use('/', controller.router);
    });
    this.app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.resolve('client', 'public', 'index.html'));
    });
  }
}

export default App;
