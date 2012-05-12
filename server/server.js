//Core shiz
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , path = require('path')

var clients = new Array();

var spriteSize = 16;
var lastBombId = 0;

gameState = {
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
    startX = Math.floor(Math.random()*gameState.width) + 1;
    startY = Math.floor(Math.random()*gameState.height) + 1;
    socket.emit('welcome', {
      gameState: gameState,
      x: startX,
      y: startY
    });
    socket.broadcast.emit('playerJoined', {id: id, x: startX, y: startY});
    console.log("Got handshake");
    console.log(data);
    clients[id] = {id: socket.id, nickName: data.nickName}
    sendMessageToAll(data.nickName + ' has joined');
  });


  //On chat message receieved
  socket.on('sendChat', function (data) {
     //Nickname changed
    console.log("Got Data");
    console.log(data);
    var message = data.nickName + ": " + data.message;
    sendMessageToAll(message);
  });

  socket.on('disconnect', function() {
    console.log('Client disconnected!');
    if (!(typeof clients[id] === 'undefined'))
    {
      sendMessageToAll(clients[id].nickName + ' has left');
      delete clients[id];
    }
  });

  socket.on('dropBomb', function (data) {
    bombDropped(id, data.gridPosition[0], data.gridPosition[1]);
  });

  socket.on('move', function (data) {
    client = clients[id];
    client.x = data.x;
    client.y = data.y;
    socket.broadcast.emit('playerMoved', {id: id, x: data.x, y: data.y} )
  });
});

function bombDropped(clientId, positionX, positionY)
{
  blastRadius = 4;
  explodeDelay = 4000;
  id = "b_" + ++lastBombId;
  console.log("Bomb " + id + " dropped at " + positionX + "," + positionY + " by " + clientId);
  io.sockets.emit('bombDropped', {id: id, x: positionX, y: positionY} );
  setTimeout(function() {
    bombExploded(clientId, id, positionX, positionY, blastRadius)
  }, explodeDelay);
}

function bombExploded(clientId, bombId, positionX, positionY, blastRadius)
{
  console.log("Bomb " + id + " EXPLODED!");
  io.sockets.emit('bombExploded', {id: bombId, x: positionX, y: positionY, blastRadius: blastRadius} );  
}

function sendMessageToAll(message)
{
  io.sockets.emit('receiveChat', { message: message})
}

//Probably won't need this but w/e
setInterval(function() {
  console.log('Status Update:');
  console.log(clients);
  console.log('Game state:');
  console.log(gameState);
}, 1000);
