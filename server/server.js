var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
var path = require('path');

app.listen(80);

function handler (request, response) {
 
    console.log('request starting...' + request.url);
     
    var filePath = request.url;
    if (filePath == '/')
        filePath = '/index.html';
     
    filePath = "./../client" + filePath;
    console.log('  file path: ' + filePath);

    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
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