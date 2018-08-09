const socketIO = require('socket.io');

// An object of nested objects
// ex : { Max: { socketID: '123' } }
const users = {};

module.exports.listen = server => {
  const io = socketIO(server);

  io.on('connection', socket => {
    socket.on('joinChat', username => {
      if (!Object.keys(users).includes(username)) {
        users[username] = {
          socketID: socket.id
        };
      }
      io.emit('getUsers', users);
      console.log('Users connected: ', users);
    });

    socket.on('disconnect', () => {
      Object.keys(users).forEach(user => {
        console.log('user: ', user);
        console.log(`${socket.id} === ${users[user].socketID} ?`);
        if (users[user].socketID === socket.id) {
          console.log(`${user} left the chat.`);
          delete users[user];
          io.emit('getUsers', users);
          console.log('Users connected: ', users);
        }
      });
    });
  });

  return io;
};
