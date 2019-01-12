import * as io from 'socket.io-client';
let ioURL = window.document.location.origin;
if (ioURL.indexOf('9000')) {
  ioURL = ioURL.replace('9000', '3000');
}
import { joinChat, populateUsers } from '../actions/chat';
import { Users } from '../../../sockets/WebSocketServer';
const socket = io.connect(ioURL);


// Listen on getUsers socket message
// and populate store with connected users
export const subscribeToUsers = dispatch => {
  socket.on('getUsers', (users: Users) => {
    return dispatch(populateUsers(users));
  });
};

// const setupSocket = (dispatch, username) => {
//   socket.emit('connection');
//   socket.emit('joinChat', username);
//
//   socket.on('getUsers', users => {
//     dispatch(populateUsers(users));
//   });
// };
//
// export default setupSocket;
