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
  ],
  bombs: [],
  players: []
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
    gameState.players[id] = {x: startX, y: startY}
    socket.emit('welcome', {
      gameState: gameState,
      x: startX * spriteSize,
      y: startY * spriteSize
    });
    socket.broadcast.emit('playerJoined', {id: id, x: startX * spriteSize, y: startY * spriteSize});
    console.log("Got handshake");
    console.log(data);
    clients[id] = {id: socket.id, nickName: data.nickName, socket: socket}
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
    if (!(typeof gameState.players[id] === 'undefined'))
    {
      delete gameState.players[id];
    }
    io.sockets.emit('playerLeft', {id: id})
  });

  socket.on('dropBomb', function (data) {
    bombDropped(id, data.gridPosition[0], data.gridPosition[1]);
  });

  socket.on('move', function (data) {
    player = gameState.players[id];
    player.x = data.x;
    player.y = data.y;
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
  gameState.bombs[id] = {x: positionX, y: positionY, id: id, blastRadius: 4}
  setTimeout( bombExploded(id), explodeDelay);
}

function bombExploded(bombId)
{
  return function()
  {
    console.log("Bomb " + bombId + " EXPLODED!");
    bomb = gameState.bombs[bombId];
    io.sockets.emit('bombExploded', {id: bombId, x: bomb.x, y: bomb.y, blastRadius: bomb.blastRadius} );  
    for(pId in gameState.players)
    {
      player = gameState.players[pId];
      px = Math.round(player.x / spriteSize);
      py = Math.round(player.y / spriteSize);
      console.log(px);
      console.log(py);
      for(i = -bomb.blastRadius; i <= bomb.blastRadius; ++i)
      if (
          (px == bomb.x - i && py == bomb.y) ||
          (px == bomb.x && py == bomb.y - i))
      {
        console.log(pId)
        clients[pId].socket.emit('dead');
        clients[pId].socket.broadcast.emit('enemyDead', {id: pId} )
      }
    }
    delete gameState.bombs[bombId];
    //io.sockets.emit('dead');
  }
}

function sendMessageToAll(message)
{
  io.sockets.emit('receiveChat', { message: message})
}

//Probably won't need this but w/e
setInterval(function() {
  console.log('Status Update:');
  // console.log(clients);
  console.log('Game state:');
  console.log(gameState);
}, 1000);
