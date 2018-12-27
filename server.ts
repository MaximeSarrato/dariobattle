import App from './app';
import * as mongoose from 'mongoose';
import AuthController from './controllers/auth.controller';
import UsersController from './controllers/users.controller';

const app = new App([new AuthController(), new UsersController()]).app;
const server = require('http').Server(app);

// Connect to database
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true }
);

// Socket.IO
require('./sockets/io').listen(server);

server.listen(process.env.PORT, () => {
  console.log('Server is listening on port: ', process.env.PORT);
});
