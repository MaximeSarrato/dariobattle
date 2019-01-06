import WebSocketServer from '../sockets/WebSocketServer';
import * as http from 'http';
import * as io from 'socket.io-client';
let wsServer: WebSocketServer;
let httpServer: http.Server;
let httpServerAddr;
let ioServer;
let wsClient;
let socket;

const username = 'Max';

beforeAll((done) => {
  httpServer = http.createServer().listen();
  httpServerAddr = httpServer.listen().address();
  wsServer = new WebSocketServer(httpServer);
  wsServer.listen();
  ioServer = wsServer.getWsServer();
  done();
});

afterAll((done) => {
  httpServer.close();
  ioServer.close();
  done();
});

beforeEach((done) => {
  wsClient = io(`http://localhost:${httpServerAddr.port}`);
  wsClient.on('connect', () => {
    socket = wsClient.io.engine.id;
    done();
  });
});

afterEach((done) => {
  wsClient.close();
  if (wsClient.connected) {
    wsClient.disconnect();
  }
  done();
});

describe('WebSocket server tests', () => {
  it('checks if there is no users', () => {
    const users = wsServer.getUsers();
    expect(users).toEqual({});
  });

  it('checks if a new user is connected', (done) => {
    wsClient.emit('joinChat', username);
    setTimeout(() => {
      const users = wsServer.getUsers();
      expect(Object.keys(users).length).toBe(1);
      done();
    }, 50);
  });

  it('checks if a user has disconnect', (done) => {
    wsClient.emit('joinChat', username);
    setTimeout(() => {
      const users = wsServer.getUsers();
      expect(Object.keys(users).length).toBe(1);
      // Disconnect the sockext
      wsClient.disconnect();
      setTimeout(() => {
        const users2 = wsServer.getUsers();
        expect(Object.keys(users2).length).toBe(0);
        done();
      }, 100);
    }, 50);
  });
});
