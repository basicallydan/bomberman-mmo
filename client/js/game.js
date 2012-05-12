window.onload = function() {
  //start crafty
  Crafty.init(400, 320);
  Crafty.canvas.init();
  
  //turn the sprite map into usable components
  Crafty.sprite(16, "/images/sprite.png", {
    grass1: [0,0],
    grass2: [1,0],
    grass3: [2,0],
    grass4: [3,0],
    flower: [0,1],
    bush1: [0,2],
    bush2: [1,2],
    player: [0,3]
  });
  
  //method to randomy generate the map
  function generateWorld() {
    //generate the grass along the x-axis
    for(var i = 0; i < 25; i++) {
      //generate the grass along the y-axis
      for(var j = 0; j < 20; j++) {
        grassType = Crafty.math.randomInt(1, 4);
        Crafty.e("2D, Canvas, grass"+grassType)
          .attr({x: i * 16, y: j * 16});
        
        //1/50 chance of drawing a flower and only within the bushes
        if(i > 0 && i < 24 && j > 0 && j < 19 && Crafty.math.randomInt(0, 50) > 49) {
          Crafty.e("2D, Canvas, flower, solid, SpriteAnimation")
            .attr({x: i * 16, y: j * 16})
            .animate("wind", 0, 1, 3)
            .bind("EnterFrame", function() {
              if(!this.isPlaying())
                this.animate("wind", 80);
            });
        }
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
      .onBombDropped(function(playerId) {
        alert("You dropped a bomb, " + playerId);
      });
  });
};