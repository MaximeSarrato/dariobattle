import io from 'socket.io-client';
import { joinChat, populateUsers } from '../actions/chat';
const socket = io('http://localhost:3000');

// Listen on getUsers socket message
// and populate store with connected users
export const subscribeToUsers = dispatch => {
  socket.on('getUsers', users => {
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
