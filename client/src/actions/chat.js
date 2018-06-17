import io from 'socket.io-client';
const socket = io('http://localhost:3000');

export const joinChat = username => {
  return dispatch => {
    socket.emit('connection');
    socket.emit('joinChat', username);
    socket.on('getUsers', users => {
      return dispatch(populateUsers(users));
    });
  };
};

export const populateUsers = users => ({
  type: 'POPULATE_USERS',
  users
});
