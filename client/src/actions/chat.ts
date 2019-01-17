import * as io from 'socket.io-client';
import { Users } from '../../../sockets/WebSocketServer';
import { ChatActionTypes } from '../types';
import { action } from 'typesafe-actions';
import { Dispatch, Action } from 'redux';

let ioURL = window.document.location.origin;
if (ioURL.indexOf('9000')) {
  ioURL = ioURL.replace('9000', '3000');
}
const socket = io.connect(ioURL);

export const joinChat = (username: string) => {
  return (dispatch: Dispatch<Action<ChatActionTypes.POPULATE_USERS>>) => {
    socket.emit('connection');
    socket.emit('joinChat', username);
    socket.on('getUsers', (users: Users) => {
      return dispatch(populateUsers(users));
    });
  };
};

export const populateUsers = (users: Users) =>
  action(ChatActionTypes.POPULATE_USERS, { users: Object.keys(users) });
