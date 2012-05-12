var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('message sent', { message: 'Hello new person' });
  socket.on('message received', function (data) {
  	socket.broadcast.emit('message sent', { message: data.message})
  	socket.emit('message sent', { message: data.message})
    console.log(data);
  });
});