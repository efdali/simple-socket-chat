const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const users = [];

app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.emit('initialize', { myself: socket.id, users });
  users.push(socket.id);

  socket.broadcast.emit('newUser', socket.id);

  socket.on('msg', (msg) => {
    socket.broadcast.emit('msg', socket.id + ' : ' + msg);
  });
  socket.on('private', ({ to, msg }) => {
    socket
      .to(to)
      .emit('private', { from: socket.id, msg: socket.id + ' : ' + msg });
  });
  socket.on('unconfirm', function (to) {
    socket.to(to).emit('unconfirm');
  });

  socket.on('disconnect', () => {
    const index = users.indexOf(socket.id);
    users.splice(index, 1);
    io.emit('disconnect', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
