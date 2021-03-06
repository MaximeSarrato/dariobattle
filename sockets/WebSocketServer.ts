import { Server } from 'http';
import * as socketIO from 'socket.io';
import logger from '../services/logger';

interface Users {
  [key: string]: {
    socketID: string;
  };
}

export default class WebSocketServer {
  private wsServer;
  // An object of nested objects
  // ex : { Max: { socketID: '123' } }
  private users: Users;

  constructor(server: Server) {
    this.wsServer = socketIO(server);
    this.users = {};
  }

  /**
   * Listening on WebSocket server.
   */
  public listen() {
    logger.info('WebSocket server has been started.');
    /**
     * New socket connection
     */
    this.wsServer.on('connection', (socket) => {
      /**
       * Socket joined the chat
       */
      socket.on('joinChat', (username: string) => {
        this.addUser(socket, username);
      });

      /**
       * Socket disconnected
       */
      socket.on('disconnect', () => {
        this.removeUser(socket);
      });
    });
  }

  /**
   * Get websocket server
   */
  public getWsServer() {
    return this.wsServer;
  }

  /**
   * Get users
   */
  public getUsers(): Users {
    return this.users;
  }

  /**
   * Add an user to the list of users if he isn't already in the list.
   * If the user has been added the client received the new list of users.
   * @param socket the socket of the user.
   * @param username the name of the user.
   */
  private addUser(socket: any, username: string): void {
    if (!Object.keys(this.users).includes(username)) {
      this.users[username] = {
        socketID: socket.id,
      };
      logger.info(`The user ${username} joined the chat`);
      this.wsServer.emit('getUsers', this.users);
    }
  }

  /**
   * Remove an user from the list of users if he was in the list.
   * If the user has been removed the client received the new list of users.
   * @param socket the socket of the user.
   */
  private removeUser(socket: any): void {
    Object.keys(this.users).forEach((user) => {
      if (this.users[user].socketID === socket.id) {
        logger.info(`The user ${user} left the chat.`);
        delete this.users[user];
        this.wsServer.emit('getUsers', this.users);
      }
    });
  }

}
