import { Server } from 'http';
import * as mongoose from 'mongoose';
import App from './app';
import AuthController from './controllers/auth.controller';
import UsersController from './controllers/users.controller';
import logger from './services/logger';
import WebSocketServer from './sockets/WebSocketServer';

const app = new App([new AuthController(), new UsersController()]).app;
const server: Server = new Server(app);

// Connect to database
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true },
);

if (process.env.NODE_ENV !== 'test') {
  // Socket.IO
  const wsServer = new WebSocketServer(server);
  wsServer.listen();

  server.listen(process.env.PORT, () => {
    logger.info(`Server is listening on port ${process.env.PORT}`);
  });
}

/**
 * Shutdown the server when system detects SIGINT
 */
process.on('SIGINT', () => {
  server.close();
  process.exit();
});

server.on('close', () => {
  logger.info('Server has been stopped.');
});

export default server;
