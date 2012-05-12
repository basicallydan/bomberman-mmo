Crafty.c('Bomber', {
  bombDropCallbacks : [],
  init: function() {
      //setup animations
      this.requires("SpriteAnimation, Collision, Multiway, Keyboard")
      .animate("walk_left", 6, 3, 8)
      .animate("walk_right", 9, 3, 11)
      .animate("walk_up", 3, 3, 5)
      .animate("walk_down", 0, 3, 2)
      //change direction when a direction change event is received
      .bind('KeyDown', function () {
        if (this.isDown('ENTER')) {
          this.trigger('BombDropped', { playerId : this.playerId });
        }
      })
      .bind("NewDirection",
        function (direction) {
          if (direction.x < 0) {
            if (!this.isPlaying("walk_left"))
              this.stop().animate("walk_left", 10, -1);
          }
          if (direction.x > 0) {
            if (!this.isPlaying("walk_right"))
              this.stop().animate("walk_right", 10, -1);
          }
          if (direction.y < 0) {
            if (!this.isPlaying("walk_up"))
              this.stop().animate("walk_up", 10, -1);
          }
          if (direction.y > 0) {
            if (!this.isPlaying("walk_down"))
              this.stop().animate("walk_down", 10, -1);
          }
          if(!direction.x && !direction.y) {
            this.stop();
          }
      })
      // A rudimentary way to prevent the user from passing solid areas
      .bind('Moved', function(from) {
        if(this.hit('solid')){
          this.attr({x: from.x, y:from.y});
        }
      });
    return this;
  },
  bomberControls: function(speed) {
    this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180})
    return this;
  },
  onBombDropped : function(callback) {
    this.bind('BombDropped', callback)
    return this;
  }
});