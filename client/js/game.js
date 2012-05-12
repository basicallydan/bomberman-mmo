var spriteSize = 16;
var player,
  otherBombers = {},
  socket;
var flash_id = 0;

function flash(message, background)
{
  flash_id += 1;
  $('body').append('<div style="background-color: #' + background + ';" id="flash-' + flash_id + '" class="flash">' + message + '</div>');
  $('#flash-' + flash_id).fadeOut(6000);
}

function sendMessage()
{
  var m =  $("#message");
  socket.emit('sendChat',
    {
      message: $("#message").val(),
      nickName: $("#nickName").val()
    }
  );
  m.val('');
}

function dropBombTest()
{
  x = $('#bombx').val();
  y = $('#bomby').val();
  pid = $("#playerId").val();
  dropBomb(socket, pid, [x, y]);
}
function move()
{
  x = $('#movex').val();
  y = $('#movey').val();
  pid = $("#playerId").val();
  move(socket, pid, [x, y]);
}
  
function connect()
{
    $('#letMeIn').fadeOut();
  //socket = io.connect('localhost');
  socket = io.connect('http://10.246.38.47');
    socket.on('connect', function() {
      $('#nickName').attr('readOnly', '1');
      $("#chat").fadeIn();
      socket.emit('handshake', {nickName: $('#nickName').val() } )
    });

    //Should be received after handshake
  socket.on('welcome', function(map)
  {
        initializeGame(map);
  });

  //When a bomb is dropped
  socket.on('bombDropped', function(bombData) {
      flash('Bomb Dropped. x: ' + bombData.x + ', y: ' + bombData.y + ', blastRadius: ' + bombData.blastRadius, '800');
  });

  //When a chat message is received
  socket.on('receiveChat', function (data) {
  $('#messages').append('<p>' + data.message + '</p>');
  $("#messages").prop({ scrollTop: $("#messages").prop("scrollHeight") });
  });

  socket.on('playerJoined', function(data) {
    flash('Player Joined: ' + data.id, '080');
    addEnemy(data.id);
  });

  socket.on('playerMoved', function(data) {
    console.log('Player Moved: ' + data.id + ' To ' + data.x + ',' + data.y);
  });
}

window.onload = function() {
  $('#nickName').val('user' + Math.floor(Math.random()*10000));
  connect();
  //start crafty
};

function addEnemy(id) {
  //create our player entity with some premade components
  var otherBomber = Crafty.e("2D, Canvas, player, OtherBomber, Animate")
    .attr({x: 160, y: 144, z: 1, playerId: id});

  otherBombers[id] = otherBomber;
}

function initializeGame(map)
{
  var width = map.width;
  var height = map.height;

  Crafty.init(width * spriteSize, height * spriteSize);
  Crafty.canvas.init();
  
  //turn the sprite map into usable components
  Crafty.sprite(spriteSize, "/images/sprite.png", {
      grass1: [0,0],
      grass2: [1,0],
      grass3: [2,0],
      grass4: [3,0],
      flower: [0,1],
      bush1: [0,2],
      bush2: [1,2],
      player: [0,3]
    }
  );
  
  //method to randomy generate the map
  function generateWorld() {
    //generate the grass along the x-axis
    for(var i = 0; i < width; i++) {
      //generate the grass along the y-axis
      for(var j = 0; j < height; j++) {
        grassType = Crafty.math.randomInt(1, 4);
        Crafty.e("2D, Canvas, grass"+grassType)
          .attr({x: i * spriteSize, y: j * spriteSize});
        }
    }
    
    //create the bushes along the x-axis which will form the boundaries
    for(var i = 0; i < 25; i++) {
      Crafty.e("2D, Canvas, wall_top, solid, bush"+Crafty.math.randomInt(1,2))
        .attr({x: i * 16, y: 0, z: 2});
      Crafty.e("2D, DOM, wall_bottom, solid, bush"+Crafty.math.randomInt(1,2))
        .attr({x: i * 16, y: 304, z: 2});
    }
    
    //create the bushes along the y-axis
    //we need to start one more and one less to not overlap the previous bushes
    for(var i = 1; i < 19; i++) {
      Crafty.e("2D, DOM, wall_left, solid, bush"+Crafty.math.randomInt(1,2))
        .attr({x: 0, y: i * 16, z: 2});
      Crafty.e("2D, Canvas, wall_right, solid, bush"+Crafty.math.randomInt(1,2))
        .attr({x: 384, y: i * 16, z: 2});
    }

    for(f in map.flowers)
    {
      var flower = map.flowers[f];
      Crafty.e("2D, Canvas, flower, solid, SpriteAnimation")
        .attr({x: flower.x * spriteSize, y: flower.y * spriteSize})
        .animate("wind", 0, 1, 3)
        .bind("EnterFrame", function() {
          if(!this.isPlaying())
            this.animate("wind", 80);
        });
    }
  }
  
  //the loading screen that will display while our assets load
  Crafty.scene("loading", function() {
    //load takes an array of assets and a callback when complete
    Crafty.load(["images/sprite.png"], function () {
      Crafty.scene("main"); //when everything is loaded, run the main scene
    });
    
    //black background with some loading text
    Crafty.background("#000");
    Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
      .text("Loading")
      .css({"text-align": "center"});
  });
  
  //automatically play the loading scene
  Crafty.scene("loading");
  
  Crafty.scene("main", function() {
    generateWorld();
    
    //create our player entity with some premade components
    player = Crafty.e("2D, Canvas, player, Bomber, Animate")
      .attr({x: 160, y: 144, z: 1, playerId: 1})
      .bomberControls(1)
      .onBombDropped(function(data) {
        console.log("You dropped a bomb, " + data.playerId + ' at ' + data.gridPosition[0] + ', ' + data.gridPosition[1]);
        dropBomb(socket, data.playerId, [data.gridPosition[0], data.gridPosition[1]]);
      })
      .onPlayerMoved(function(data) {
        console.log("Moved from " + data.from.x +',' + data.from.y + ' to ' + data.to.x + ',' + data.to.y);
        changePosition(socket, data.playerId, [data.to.x, data.to.y]);
      });
  });
};