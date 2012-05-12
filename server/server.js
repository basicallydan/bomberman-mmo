//Core shiz
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , path = require('path')

var clients = new Array();

map = {
  width: 25,
  height: 20,
  flowers: [
    {x: 10, y: 10},
    {x: 15, y: 15},
    {x: 5, y: 5}
  ]
};

app.listen(80);

//Simple handler to serve up static files
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

//When connections happen
io.sockets.on('connection', function (socket) {
  var id = "c_" + socket.id.toString();
  console.log('Client connected, id: ' + id);

  //Send initial status packet
  socket.emit('receiveChat', { message: 'Hello new person' });

  //On initial message
  socket.on('handshake', function (data) {
    socket.emit('welcome', map);
    console.log("Got handshake");
    console.log(data);
    clients[id] = {id: socket.id}
    clients[id].nickName = data.nickName;
    sendToAll(data.nickName + ' has joined');
  });


  //On chat message receieved
  socket.on('sendChat', function (data) {
     //Nickname changed
    if (clients[id].nickName != data.nickName)
    {
      sendToAll(clients[id].nickName + " is now called " + data.nickName);
      clients[id].nickName = data.nickName;
    }

    console.log("Got Data");
    console.log(data);
    var message = data.nickName + ": " + data.message;
    sendToAll(message);
  });

  socket.on('disconnect', function() {
    console.log('Client disconnected!');
    sendToAll(clients[id] + ' has left');
    delete clients[id]
  });

  socket.on('dropBomb', function (data) {
    bombDropped(id, data.gridPosition[0], data.gridPosition[1]);
  });

  socket.on('move', function (data) {
    console.log("Got Data");
    console.log(data);
  });
});

function bombDropped(clientId, positionX, positionY)
{
  console.log("Bomb dropped at " + positionX + "," + positionY + " by " + clientId);
}

function sendToAll(message)
{
  io.sockets.emit('receiveChat', { message: message})
}

//Probably won't need this but w/e
setInterval(function() {
  console.log('Status Update:');
  console.log(clients);
}, 1000);
