Crafty.c('Bomber', {
  bombDropCallbacks : [],
  init: function() {
      // 0: v, 1: h
      this.movementKeyStack = [];
      //setup animations
      this.requires("SpriteAnimation, Collision, Fourway, Keyboard")
      .animate("walk_left", 6, 3, 8)
      .animate("walk_right", 9, 3, 11)
      .animate("walk_up", 3, 3, 5)
      .animate("walk_down", 0, 3, 2)
      .bind('KeyDown', function(e) {
        if(e.key === Crafty.keys['LEFT_ARROW']) {
          if(this.movementKeyStack[this.movementKeyStack.length - 1] !== 'L') {
            removeItem(this.movementKeyStack, 'L');
            this.movementKeyStack.push('L');
            this.trigger('PlayerKeyboardChange', 'L');
          }
        }

        if(e.key === Crafty.keys['RIGHT_ARROW']) {
          if(this.movementKeyStack[this.movementKeyStack.length - 1] !== 'R') {
            removeItem(this.movementKeyStack, 'R');
            this.movementKeyStack.push('R');
            this.trigger('PlayerKeyboardChange', 'R');
          }
        }

        if(e.key === Crafty.keys['UP_ARROW']) {
          if(this.movementKeyStack[this.movementKeyStack.length - 1] !== 'U') {
            removeItem(this.movementKeyStack, 'U');
            this.movementKeyStack.push('U');
            this.trigger('PlayerKeyboardChange', 'U');
          }
        }

        if(e.key === Crafty.keys['DOWN_ARROW']) {
          if(this.movementKeyStack[this.movementKeyStack.length - 1] !== 'D') {
            removeItem(this.movementKeyStack, 'D');
            this.movementKeyStack.push('D');
            this.trigger('PlayerKeyboardChange', 'D');
          }
        }
      })
      .bind('KeyUp', function(e) {
        if (e.key == Crafty.keys['ENTER']) {
          if(this.isOnTopOfASolid() === false) {
            this.trigger('BombDropped', { gridPosition: this.getGridPosition() });
          } else {
            console.log("Can't drop a bomb on top of another solid");
          }
        }

        if(e.key === Crafty.keys['LEFT_ARROW']) {
          removeItem(this.movementKeyStack, 'L');
        }

        if(e.key === Crafty.keys['RIGHT_ARROW']) {
          removeItem(this.movementKeyStack, 'R');
        }

        if(e.key === Crafty.keys['UP_ARROW']) {
          removeItem(this.movementKeyStack, 'U');
        }

        if(e.key === Crafty.keys['DOWN_ARROW']) {
          removeItem(this.movementKeyStack, 'D');
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
        if(this.hit('solid')) {
          //if(this.isOnTopOfASolid() === false) {
            this.attr({x: from.x, y:from.y});
          //}
        }
        else {
          this.trigger('PlayerMoved', { from : from, to : { x : this.x, y : this.y } });
        }
      });
    return this;
  },
  isOnTopOfASolid : function () {
    if(this.hit('solid')) {
      var hitObject = this.hit('solid');
      console.log('Hit object is at ' + hitObject[0].obj.x + ',' + hitObject[0].obj.y);
      var gridX = Math.floor(hitObject[0].obj.x / spriteSize) + 1;
      var gridY = Math.floor(hitObject[0].obj.y / spriteSize) + 1;
      if(this.getGridPosition()[0] === gridX && this.getGridPosition()[1] === gridY) {
        return true;
      }
    }
    return false;
  },
  bomberControls: function(speed) {
    this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});
    return this;
  },
  onBombDropped : function(callback) {
    this.bind('BombDropped', callback)
    return this;
  },
  onPlayerKeyboardChanged : function(callback) {
    this.bind('PlayerKeyboardChange', callback);
    return this;
  },
  onPlayerMoved : function (callback) {
    this.bind('PlayerMoved', callback);
    return this;
  },
  getGridPosition : function() {
    return [Math.floor(this.x / 16), Math.floor(this.y /16)];
  }
});