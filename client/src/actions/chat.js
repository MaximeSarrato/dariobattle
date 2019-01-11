import io from 'socket.io-client';
let ioURL = window.document.location.origin;
if (ioURL.indexOf('9000')) {
  ioURL = ioURL.replace('9000', '3000');
}
const socket = io(ioURL);

export const joinChat = username => {
  return dispatch => {
    console.log('ioURL: ', ioURL);

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
